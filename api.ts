/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgenticQueryResponse, DiseaseResult, MarketPrice, GovScheme } from "../types";

export async function checkBackendHealth(): Promise<{ status: string; hasApiKey: boolean }> {
  const res = await fetch("/api/health");
  return res.json();
}

export async function queryAgenticPipeline(
  query: string,
  context: {
    cropName?: string;
    location?: string;
    soilType?: string;
    growthStage?: string;
    image?: string;
  }
): Promise<AgenticQueryResponse> {
  const res = await fetch("/api/agentic/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, context }),
  });

  if (!res.ok) {
    throw new Error("Failed to execute agentic workflow.");
  }
  return res.json();
}

export async function detectLeafDisease(imageBase64: string): Promise<DiseaseResult> {
  const res = await fetch("/api/disease/detect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: imageBase64 }),
  });

  if (!res.ok) {
    throw new Error("Failed to perform leaf photo disease scan.");
  }
  return res.json();
}

export async function getMarketPrices(crop?: string, state?: string): Promise<MarketPrice[]> {
  const params = new URLSearchParams();
  if (crop) params.append("crop", crop);
  if (state) params.append("state", state);

  const res = await fetch(`/api/markets?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch market rates.");
  }
  return res.json();
}

export async function getGovSchemes(): Promise<GovScheme[]> {
  const res = await fetch("/api/schemes");
  if (!res.ok) {
    throw new Error("Failed to fetch schemes database.");
  }
  return res.json();
}
