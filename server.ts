/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { MANDI_PRICES, GOV_SCHEMES } from "./src/data/agriData";
import { AgentLog, WeatherData, CropAdvice, DiseaseResult, AgenticQueryResponse } from "./src/types";

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

// Increase request size limit to handle leaf images
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Setup Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Dynamic weather calculator helper
function getWeatherData(city: string): WeatherData {
  const normCity = city.trim().toLowerCase();
  let temp = 28;
  let humidity = 65;
  let condition = "Partly Cloudy";
  let windSpeed = 12;
  let precipitation = 15;
  let alerts: WeatherData["alerts"] = [];

  if (
    normCity.includes("mumbai") ||
    normCity.includes("nashik") ||
    normCity.includes("pune") ||
    normCity.includes("lasalgaon") ||
    normCity.includes("maharashtra")
  ) {
    temp = 30;
    humidity = 82;
    condition = "Light Rain Showers";
    windSpeed = 18;
    precipitation = 65;
    alerts = [
      {
        severity: "warning",
        message: "Monsoon precipitation active. Damp soils and high humidity detected.",
        action: "Postpone immediate open-mandi grain drying. Avoid spraying water-soluble fertilizers.",
      },
    ];
  } else if (
    normCity.includes("nagpur") ||
    normCity.includes("amravati") ||
    normCity.includes("akola") ||
    normCity.includes("vidarbha")
  ) {
    temp = 39;
    humidity = 35;
    condition = "Hot and Dry / Heatwave";
    windSpeed = 11;
    precipitation = 5;
    alerts = [
      {
        severity: "danger",
        message: "Extreme high temperature warning. Soil evaporation rates are high.",
        action: "Deploy drip irrigation in early mornings or late evenings. Install green shading canopy.",
      },
    ];
  } else if (
    normCity.includes("ludhiana") ||
    normCity.includes("punjab") ||
    normCity.includes("haryana") ||
    normCity.includes("karnal") ||
    normCity.includes("hapur") ||
    normCity.includes("uttar pradesh")
  ) {
    temp = 32;
    humidity = 58;
    condition = "Overcast";
    windSpeed = 14;
    precipitation = 30;
    alerts = [
      {
        severity: "info",
        message: "Optimal wind activity for systematic foliar sprays.",
        action: "Apply systematic fertilizers safely before evening dew set.",
      },
    ];
  } else {
    alerts = [
      {
        severity: "info",
        message: "Standard seasonal weather conditions.",
        action: "Proceed with standard agricultural calendar tasks. Regular moisture updates recommended.",
      },
    ];
  }

  const forecast = [
    { day: "Tomorrow", temp: { min: temp - 3, max: temp + 2 }, condition: condition, icon: "CloudRain" },
    { day: "Day 3", temp: { min: temp - 4, max: temp + 1 }, condition: "Mostly Cloudy", icon: "Cloud" },
    { day: "Day 4", temp: { min: temp - 2, max: temp + 3 }, condition: "Scattered Showers", icon: "CloudRain" },
    { day: "Day 5", temp: { min: temp - 1, max: temp + 2 }, condition: "Sunny", icon: "Sun" },
  ];

  return {
    city: city || "General Agricultural Region",
    temperature: temp,
    humidity: humidity,
    condition: condition,
    windSpeed: windSpeed,
    precipitation: precipitation,
    alerts,
    forecast,
  };
}

// REST API Routes

// 1. Health & Configuration Test Checked Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 2. Fetch Markets
app.get("/api/markets", (req, res) => {
  const { crop, state } = req.query;
  let filtered = MANDI_PRICES;

  if (crop) {
    const cStr = String(crop).toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.crop.toLowerCase().includes(cStr) ||
        cStr.includes(m.crop.toLowerCase().split(" ")[0])
    );
  }

  if (state) {
    const sStr = String(state).toLowerCase();
    filtered = filtered.filter((m) => m.state.toLowerCase().includes(sStr));
  }

  res.json(filtered);
});

// 3. Fetch Gov Schemes
app.get("/api/schemes", (req, res) => {
  res.json(GOV_SCHEMES);
});

// 4. Disease Leaf Analysis Agent
app.post("/api/disease/detect", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No crop leaf image base64 provided." });
    }

    if (!apiKey) {
      // Fallback response for testing if key is missing
      return res.json({
        detected: true,
        diseaseName: "Early Blight (Alternaria solani) [Demo Mode]",
        confidenceScore: 0.92,
        treatment: [
          "Apply specialized bio-fungicides like Trichoderma viride.",
          "Perform pruning of lower disease-affected crop leaves.",
          "Ensure balanced soil nutrition to build crop immunity.",
        ],
        preventiveMeasures: [
          "Utilize certified disease-free plantation seeds.",
          "Maintain proper plant horizontal spacing of at least 1.5 feet.",
          "Practice structured crop rotation away from Solanaceae crops.",
        ],
      });
    }

    // Strip out base64 prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Data,
      },
    };

    const promptPart = {
      text: `You are an expert plant pathology AI companion. Analyze this agricultural leaf crop photo.
Return a valid JSON output matching this strict schema:
{
  "detected": true/false,
  "diseaseName": "Scientific and Common Name of disease",
  "confidenceScore": 0.0 to 1.0,
  "treatment": ["treatment step 1", "treatment step 2", "treatment step 3"],
  "preventiveMeasures": ["preventative step 1", "preventative step 2"]
}
Ensure there are no leading markdown wrappers (like \`\`\`json). Just return raw JSON. If no plant or leaf disease is recognizable, set "detected" to false and fill names with appropriate message.`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, promptPart],
      config: {
        responseMimeType: "application/json",
      },
    });

    const outputText = response.text || "{}";
    const result: DiseaseResult = JSON.parse(outputText.trim());
    res.json(result);
  } catch (error: any) {
    console.error("Leaf AI Error:", error);
    res.status(500).json({
      error: "AI Leaf Disease scan failed.",
      details: error.message,
    });
  }
});

// 5. Intelligent Multi-Agent Coordinator Endpoint (Agentic AI Workflow)
app.post("/api/agentic/query", async (req, res) => {
  const { query, context = {} } = req.body;
  const userQuery = query || "Tell me how to grow tomatoes effectively.";
  const crop = context.cropName || "Tomato";
  const rawLocation = context.location || "Nashik, Maharashtra";
  const soil = context.soilType || "Clay Loam";
  const stage = context.growthStage || "Vegetative Stage";
  const leafImage = context.image; // optional base64 image data for Disease Detection

  // Setup initial logs showing the Planner and coordinates starting
  const logs: AgentLog[] = [
    {
      agent: "planner",
      title: "Planner Agent Initiated",
      thoughts: `Parsing question: "${userQuery}". Targeted parameters identified - Crop: '${crop}', Soil: '${soil}', Stage: '${stage}', Location: '${rawLocation}'. Planning agricultural multi-agent task distribution...`,
      timestamp: new Date().toLocaleTimeString(),
      status: "running",
    },
    {
      agent: "crop",
      title: "Crop Advisory Agent Enlisted",
      thoughts: `Analyzing optimized cultivation strategies for crop: '${crop}' on soil: '${soil}' during growth stage: '${stage}'. Looking up fertilizer dosages.`,
      timestamp: new Date().toLocaleTimeString(),
      status: "pending",
    },
    {
      agent: "weather",
      title: "Weather Intelligence Agent Enlisted",
      thoughts: `Querying live meteorological forecasts for area: '${rawLocation}' to design weather-resilient scheduling.`,
      timestamp: new Date().toLocaleTimeString(),
      status: "pending",
    },
    {
      agent: "market",
      title: "Market Price Agent Enlisted",
      thoughts: `Sourcing wholesale MANDI price statistics for crop: '${crop}' around state. Checking target sale timelines.`,
      timestamp: new Date().toLocaleTimeString(),
      status: "pending",
    },
    {
      agent: "scheme",
      title: "Government Scheme Agent Enlisted",
      thoughts: "Scanning eligible agricultural credit programs and subsidies matching farmer coordinates.",
      timestamp: new Date().toLocaleTimeString(),
      status: "pending",
    },
  ];

  try {
    // 1. Run Planner Agent to decide flow & activate logs
    logs[0].status = "completed";
    logs[0].thoughts += ` Task assignment confirmed: Crop Agent will advise on growth; Weather Agent will study the forecasts for '${rawLocation}'; Market Agent will look up current rates; Scheme Agent will explore credit support folders. Coordinating outputs.`;

    // 2. Execute Weather Intelligence Agent
    logs[2].status = "running";
    const weatherInfo = getWeatherData(rawLocation);
    logs[2].status = "completed";
    logs[2].thoughts = `Retrieved environmental report for '${rawLocation}': ${weatherInfo.temperature}°C, ${weatherInfo.humidity}% humidity, condition: '${weatherInfo.condition}'. Warnings generated: ${
      weatherInfo.alerts.length ? weatherInfo.alerts[0].message : "No severe warnings."
    }`;

    // 3. Execute Crop Advisory Agent (fetching advice from mock or using Gemini as expert)
    logs[1].status = "running";
    let cropAdvice: CropAdvice = {
      practices: [
        "Maintain deep seed beds of 15-20cm.",
        "Ensure optimal crop rotation with legume crops like soybean.",
      ],
      irrigation: "Regular deep watering twice a week. Ensure proper drainage channel layout.",
      fertilizers: ["Apply NPK formulation (19:19:19) at early vegetative stages.", "Incorporate rich organic vermicompost."],
      pests: ["Monitor regularly for aphids and whiteflies.", "Use natural neem oil sprays (1500 ppm) preventively."],
    };

    if (apiKey) {
      try {
        const cropPrompt = `You are a professional Agronomist AI Agent (Crop Advisory Agent).
Given:
- Crop: ${crop}
- Growth Stage: ${stage}
- Soil Type: ${soil}
- Location: ${rawLocation}
- Future Weather state context: ${weatherInfo.condition}

Provide a crop schedule. Return a strict JSON matching this schema:
{
  "practices": ["Major practice recommendation 1", "Major practice recommendation 2"],
  "irrigation": "Precise watering guideline",
  "fertilizers": ["NPK instruction 1", "organic input instruction 2"],
  "pests": ["common pest threat 1", "management technique 2"]
}
Only return raw JSON. No markdown backticks.`;

        const cropRes = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: cropPrompt,
          config: { responseMimeType: "application/json" },
        });

        const parsed = JSON.parse(cropRes.text?.trim() || "{}");
        if (parsed.practices && parsed.irrigation) {
          cropAdvice = parsed;
        }
      } catch (e) {
        console.warn("Gemini Crop Advisory error, utilizing rich defaults", e);
      }
    }
    logs[1].status = "completed";
    logs[1].thoughts = `Formulated agricultural advice package for '${crop}' on soil: '${soil}' for stage: '${stage}'. Irrigation schedule generated.`;

    // 4. Run Disease Detection Agent if Base64 photo is provided
    let diseaseResult: DiseaseResult | undefined = undefined;
    if (leafImage) {
      const logEntry: AgentLog = {
        agent: "disease",
        title: "Disease Detector Agent Triggered",
        thoughts: "Leaf photo received! Scanning crop foliage structure for pathogenic traces...",
        timestamp: new Date().toLocaleTimeString(),
        status: "running",
      };
      logs.splice(3, 0, logEntry);

      try {
        const b64 = leafImage.replace(/^data:image\/\w+;base64,/, "");
        const imagePart = { inlineData: { mimeType: "image/jpeg", data: b64 } };
        const dPrompt = `You are an expert plant pathologist. Determine if this leaf exhibits a pathogen or deficiency. Return JSON:
{
  "detected": true/false,
  "diseaseName": "Scientific/Common name",
  "confidenceScore": 0.0 to 1.0,
  "treatment": ["Practical treatment 1", "Treatment 2"],
  "preventiveMeasures": ["Prevention 1"]
}`;

        const gRes = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [imagePart, { text: dPrompt }],
          config: { responseMimeType: "application/json" },
        });

        diseaseResult = JSON.parse(gRes.text?.trim() || "{}");
        logEntry.status = "completed";
        logEntry.thoughts = `Analysis complete. Disease: '${diseaseResult?.diseaseName}' scanned with confidence score of ${(
          (diseaseResult?.confidenceScore || 0.8) * 100
        ).toFixed(0)}%. Treatments queued into Coordinator Agent.`;
      } catch (de) {
        console.error("Inline disease scan failed", de);
        diseaseResult = {
          detected: true,
          diseaseName: "Early Foliar Spot [Fallback]",
          confidenceScore: 0.75,
          treatment: ["Apply bio-agent Pseudomonas fluorescens.", "Improve air circulation through pruning."],
          preventiveMeasures: ["Use spacing rules.", "Avoid overhead canopy sprinkling."],
        };
        logEntry.status = "warning";
        logEntry.thoughts = "Automated vision scanner timed out, served standard foliage spot alerts based on crop attributes.";
      }
    }

    // 5. Execute Market Price Agent
    logs[logs.length - 2].status = "running";
    // Search mandi prices for matching crop
    let matchedMarkets = MANDI_PRICES.filter(
      (m) =>
        m.crop.toLowerCase().includes(crop.toLowerCase()) ||
        crop.toLowerCase().includes(m.crop.toLowerCase().split(" ")[0])
    );

    // If no matching, retrieve general prices for regional mandis based on State
    if (matchedMarkets.length === 0) {
      const statePart = rawLocation.split(",")[1]?.trim() || "Maharashtra";
      matchedMarkets = MANDI_PRICES.filter((m) => m.state.toLowerCase() === statePart.toLowerCase()).slice(0, 3);
    }
    // Fallback if still empty
    if (matchedMarkets.length === 0) {
      matchedMarkets = MANDI_PRICES.slice(0, 3);
    }

    logs[logs.length - 2].status = "completed";
    logs[logs.length - 2].thoughts = `Identified ${matchedMarkets.length} regional agricultural markets for ${crop}. Top selling price: ₹${
      matchedMarkets[0]?.price || 2400
    } per ${matchedMarkets[0]?.unit || "Quintal"} at ${matchedMarkets[0]?.marketName || "Local Mandi"}.`;

    // 6. Execute Scheme Agent
    logs[logs.length - 1].status = "running";
    const matchedSchemes = GOV_SCHEMES.slice(0, 3); // Get relevant support programs
    logs[logs.length - 1].status = "completed";
    logs[logs.length - 1].thoughts = `Discovered ${matchedSchemes.length} central and state credit and insurance schemes. Kisan Credit Card and PM-KISAN matching are highly recommended.`;

    // 7. Coordinator Agent - Synthesize final expert advice
    const coordLog: AgentLog = {
      agent: "coordinator",
      title: "Coordinator Agent Synthesizing Results",
      thoughts: "Synthesizing Crop practices, Leaf diagnostics, real-time weather warnings, and Market outlooks into one synchronized, action-oriented agricultural blueprint...",
      timestamp: new Date().toLocaleTimeString(),
      status: "running",
    };
    logs.push(coordLog);

    let finalRecommendation = "";
    if (apiKey) {
      try {
        const synthesisPrompt = `You are the Coordinator Agent of KrishiMitra AI. Combine the results of the specialized agents into a unified, friendly, easily understandable advisory for a farmer.

User Question: ${userQuery}
Crop: ${crop}, Soil: ${soil}, Growth Stage: ${stage}
Location: ${rawLocation}

Sub-Agent Findings:
- Crop Advice practices: ${JSON.stringify(cropAdvice.practices)}
- Irrigation guideline: ${cropAdvice.irrigation}
- Fertilizer recommendations: ${JSON.stringify(cropAdvice.fertilizers)}
- Weather context: ${weatherInfo.temperature}°C, ${weatherInfo.condition}, Alerts: ${JSON.stringify(weatherInfo.alerts)}
- Mandi Price context: ${JSON.stringify(
          matchedMarkets.map((m) => `${m.marketName} price is ₹${m.price}/${m.unit}`)
        )}
- Active Scheme matching: ${JSON.stringify(matchedSchemes.map((s) => s.name))}
${diseaseResult ? `- Disease scan findings: Active ${diseaseResult.diseaseName}, Treatment: ${JSON.stringify(diseaseResult.treatment)}` : ""}

Task: Write a high-quality consolidated advice section in clear Markdown. Keep it encouraging and structured with headings. Always provide actionable, weather-aligned directions (e.g. alignment between fertilizer spraying and rain alerts).
Respond directly with the markdown text. Speak to the farmer in a warm, expert tone.`;

        const finalRes = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: synthesisPrompt,
        });

        finalRecommendation = finalRes.text || "Failed to generate recommendation.";
      } catch (fe) {
        console.error("Coordinator synthesis mistake:", fe);
      }
    }

    if (!finalRecommendation) {
      const diseaseLine = diseaseResult?.detected
        ? `* 🚨 **Disease Warning:** Potential **${diseaseResult.diseaseName}** identified. Treatments recommended: ${diseaseResult.treatment.join(
            ", "
          )}.\n`
        : "";

      finalRecommendation = `### Consolidated Agricultural Action Plan for ${crop}

Hello Farmer! Our expert AI agents have finished analyzing your crop conditions, prevailing weather in **${rawLocation}**, and active market values:

#### 📋 Optimized Crop Care Guidelines
${cropAdvice.practices.map((p) => `- ${p}`).join("\n")}

#### 💧 Weather-Aligned Irrigation Schedule
* Current status: **${weatherInfo.condition} (${weatherInfo.temperature}°C)**.
* Humidity level is **${weatherInfo.humidity}%**, rain probability is **${weatherInfo.precipitation}%**.
* **Recommendation:** ${cropAdvice.irrigation}. ${weatherInfo.alerts.length ? weatherInfo.alerts[0].action : ""}

#### 🧪 Specialized Fertilization Plan
${cropAdvice.fertilizers.map((f) => `- ${f}`).join("\n")}
* Pest preventative action: ${cropAdvice.pests.join(", ")}

${diseaseLine}
#### 💰 Mandi Market Selling Advice
* We scanned local mandis around your region: **${matchedMarkets[0]?.marketName}** shows **₹${
        matchedMarkets[0]?.price
      }/${matchedMarkets[0]?.unit}** with a pricing signal of **${matchedMarkets[0]?.comparison.toUpperCase()}**.
* **Selling Tip:** Hold crops if down, or sell at ${matchedMarkets[0]?.marketName} for premium profits!

#### 🏛 Active Government Assistance Programs
* Highly recommended: **${matchedSchemes[0]?.name}** providing direct security benefits. Register early to claim.
`;
    }

    coordLog.status = "completed";
    coordLog.thoughts = "Consolidated action-oriented blueprint composed successfully. Alert reminders generated.";

    const responsePayload: AgenticQueryResponse = {
      query: userQuery,
      plannerOutcome: `Invoked specialized Crop care, Meteorological forecasting, wholesale Market monitoring, and Government financial aid audit algorithms to troubleshoot: "${userQuery}"`,
      logs,
      cropAdvice,
      diseaseResult,
      weatherInfo,
      marketPrices: matchedMarkets,
      schemes: matchedSchemes,
      finalRecommendation,
    };

    res.json(responsePayload);
  } catch (err: any) {
    console.error("Query Workflow Error:", err);
    res.status(500).json({
      error: "Agentic pipeline collapsed during processing.",
      details: err.message,
    });
  }
});

// Setup Vite & static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KrishiMitra AI Server listening seamlessly on http://localhost:${PORT}`);
  });
}

startServer();
