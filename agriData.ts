/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MarketPrice, GovScheme } from "../types";

export const MANDI_PRICES: MarketPrice[] = [
  {
    id: "m_1",
    marketName: "Lasalgaon Mandi",
    city: "Nashik",
    state: "Maharashtra",
    crop: "Onion (Pyaaz)",
    price: 2450,
    minPrice: 1800,
    maxPrice: 2600,
    unit: "Quintal",
    lastUpdated: "Today",
    comparison: "up",
    changePercentage: 4.8
  },
  {
    id: "m_2",
    marketName: "Pimpalgaon Mandi",
    city: "Nashik",
    state: "Maharashtra",
    crop: "Onion (Pyaaz)",
    price: 2500,
    minPrice: 1900,
    maxPrice: 2650,
    unit: "Quintal",
    lastUpdated: "Today",
    comparison: "up",
    changePercentage: 5.2
  },
  {
    id: "m_3",
    marketName: "Kalyan Mandi",
    city: "Mumbai",
    state: "Maharashtra",
    crop: "Onion (Pyaaz)",
    price: 2800,
    minPrice: 2200,
    maxPrice: 3000,
    unit: "Quintal",
    lastUpdated: "Today",
    comparison: "stable",
    changePercentage: 0.0
  },
  {
    id: "m_4",
    marketName: "Pune Mandi",
    city: "Pune",
    state: "Maharashtra",
    crop: "Tomato (Tamatar)",
    price: 1850,
    minPrice: 1500,
    maxPrice: 2100,
    unit: "Quintal",
    lastUpdated: "Today",
    comparison: "down",
    changePercentage: -3.5
  },
  {
    id: "m_5",
    marketName: "Nagpur Mandi",
    city: "Nagpur",
    state: "Maharashtra",
    crop: "Tomato (Tamatar)",
    price: 1700,
    minPrice: 1400,
    maxPrice: 1950,
    unit: "Quintal",
    lastUpdated: "Today",
    comparison: "down",
    changePercentage: -2.1
  },
  {
    id: "m_6",
    marketName: "Akola Mandi",
    city: "Akola",
    state: "Maharashtra",
    crop: "Cotton (Kapas)",
    price: 7400,
    minPrice: 6800,
    maxPrice: 7650,
    unit: "Quintal",
    lastUpdated: "Today",
    comparison: "up",
    changePercentage: 1.5
  },
  {
    id: "m_7",
    marketName: "Amravati Mandi",
    city: "Amravati",
    state: "Maharashtra",
    crop: "Cotton (Kapas)",
    price: 7300,
    minPrice: 6700,
    maxPrice: 7500,
    unit: "Quintal",
    lastUpdated: "Yesterday",
    comparison: "stable",
    changePercentage: 0.2
  },
  {
    id: "m_8",
    marketName: "Hapur Mandi",
    city: "Hapur",
    state: "Uttar Pradesh",
    crop: "Wheat (Gehun)",
    price: 2250,
    minPrice: 2100,
    maxPrice: 2350,
    unit: "Quintal",
    lastUpdated: "Today",
    comparison: "up",
    changePercentage: 0.9
  },
  {
    id: "m_9",
    marketName: "Khanna Mandi",
    city: "Ludhiana",
    state: "Punjab",
    crop: "Rice (Chawal - Paddy)",
    price: 2060,
    minPrice: 1950,
    maxPrice: 2100,
    unit: "Quintal",
    lastUpdated: "Today",
    comparison: "stable",
    changePercentage: 0.0
  },
  {
    id: "m_10",
    marketName: "Solapur Mandi",
    city: "Solapur",
    state: "Maharashtra",
    crop: "Pomegranate (Anar)",
    price: 12500,
    minPrice: 9000,
    maxPrice: 14000,
    unit: "Quintal",
    lastUpdated: "Today",
    comparison: "up",
    changePercentage: 8.4
  },
  {
    id: "m_11",
    marketName: "Sangli Mandi",
    city: "Sangli",
    state: "Maharashtra",
    crop: "Turmeric (Haldi)",
    price: 9800,
    minPrice: 8500,
    maxPrice: 11000,
    unit: "Quintal",
    lastUpdated: "Today",
    comparison: "up",
    changePercentage: 3.2
  },
  {
    id: "m_12",
    marketName: "Junnar Mandi",
    city: "Pune",
    state: "Maharashtra",
    crop: "Tomato (Tamatar)",
    price: 1900,
    minPrice: 1600,
    maxPrice: 2200,
    unit: "Quintal",
    lastUpdated: "Today",
    comparison: "stable",
    changePercentage: 0.5
  },
  {
    id: "m_13",
    marketName: "Karnal Mandi",
    city: "Karnal",
    state: "Haryana",
    crop: "Rice (Chawal - Paddy)",
    price: 2150,
    minPrice: 2000,
    maxPrice: 2280,
    unit: "Quintal",
    lastUpdated: "Today",
    comparison: "up",
    changePercentage: 1.2
  }
];

export const GOV_SCHEMES: GovScheme[] = [
  {
    id: "scheme_1",
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    nameHi: "पीएम किसान सम्मान निधि योजना",
    nameMr: "पंतप्रधान किसान सन्मान निधी योजना",
    ministry: "Ministry of Agriculture and Farmers Welfare",
    eligibility: "All small and marginal landholding farmer families with cultivable land holdings in their names.",
    benefits: "Direct income support of ₹6,000 per year payable in three equal installments of ₹2,000 each directly into the bank accounts.",
    howToApply: "Register online via PM-KISAN Portal, Common Service Centers (CSCs), or approach Local Revenue Officers (Patwari / Nodal Officer).",
    website: "https://pmkisan.gov.in",
    subsidyPercentage: "100% Direct Funding"
  },
  {
    id: "scheme_2",
    name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    nameHi: "प्रधानमंत्री फसल बीमा योजना",
    nameMr: "पंतप्रधान पीक विमा योजना",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    eligibility: "Farmers including sharecroppers and tenant farmers growing notified crops in notified areas. Loan-taking farmers are also automatically registered.",
    benefits: "Comprehensive insurance coverage against crop failure due to non-preventable natural risks. Premium rate is extremely low: 2% for Kharif, 1.5% for Rabi, and 5% for horticultural crops.",
    howToApply: "Apply online via PMFBY portal, through local banks, authorized insurance agents, or Common Service Centers (CSCs) within notified dates.",
    website: "https://pmfby.gov.in",
    subsidyPercentage: "Premium Subsidized up to 90%"
  },
  {
    id: "scheme_3",
    name: "SHC (Soil Health Card Scheme)",
    nameHi: "मृदा स्वास्थ्य कार्ड योजना",
    nameMr: "जमीन आरोग्य पत्रिका योजना",
    ministry: "Department of Agriculture, Cooperation & Farmers Welfare",
    eligibility: "All farmers owning cultivable land holdings in any state of India.",
    benefits: "Free detailed report indicating status of 12 soil parameters (N, P, K, Micro-nutrients, pH, EC, Organic Carbon) and crop-wise dosage recommendations of chemical & organic fertilizers.",
    howToApply: "Collect soil sample with the help of agricultural extension officers or submit to regional Soil Testing Labs. Reports are compiled online.",
    website: "https://soilhealth.dac.gov.in",
    subsidyPercentage: "100% Government Sponsored"
  },
  {
    id: "scheme_4",
    name: "PM-KMY (Pradhan Mantri Kisan Maandhan Yojana)",
    nameHi: "प्रधानमंत्री किसान मान-धन योजना (पेंशन)",
    nameMr: "पंतप्रधान शेतकरी मानधन योजना",
    ministry: "Ministry of Agriculture & Farmers Welfare in partnership with LIC",
    eligibility: "Small and marginal farmers aged between 18 and 40 years, with cultivating land holding up to 2 hectares.",
    benefits: "Voluntary pension scheme. A monthly pension of ₹3,000 after attaining the age of 60. The government matches the farmer's monthly contribution.",
    howToApply: "Register at nearest CSCs or self-enrollment online on Mandhan.in portal. Requires Aadhaar and active Savings Bank Account.",
    website: "https://maandhan.in",
    subsidyPercentage: "50:50 Financial Contribution"
  },
  {
    id: "scheme_5",
    name: "KCC (Kisan Credit Card Scheme)",
    nameHi: "किसान क्रेडिट कार्ड योजना",
    nameMr: "किसान क्रेडिट कार्ड योजना",
    ministry: "NABARD / Reserve Bank of India",
    eligibility: "All farmers (individual/joint), tenant farmers, oral lessees, sharecroppers, and self-help groups.",
    benefits: "Provides short-term credit loans up to ₹3 Lakhs for cultivation, harvesting expenses, and maintenance. Interest rate is subsidized down to 4% with timely repayments.",
    howToApply: "Apply at any local public or cooperative bank branch with land record papers, ID proofs, and crop plans. Online forms are also accessible on most bank websites.",
    website: "https://www.nabard.org",
    subsidyPercentage: "Subsidized Interest at 4%"
  }
];
