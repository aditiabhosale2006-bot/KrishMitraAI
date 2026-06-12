/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AgentType = 
  | 'planner' 
  | 'crop' 
  | 'disease' 
  | 'weather' 
  | 'market' 
  | 'scheme' 
  | 'coordinator';

export interface AgentLog {
  agent: AgentType;
  title: string;
  thoughts: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'warning';
}

export interface FarmingContext {
  cropName?: string;
  location?: string;
  soilType?: string;
  growthStage?: string;
}

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  precipitation: number;
  alerts: { severity: 'info' | 'warning' | 'danger'; message: string; action: string }[];
  forecast: {
    day: string;
    temp: { min: number; max: number };
    condition: string;
    icon: string;
  }[];
}

export interface MarketPrice {
  id: string;
  marketName: string;
  city: string;
  state: string;
  crop: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  unit: string;
  lastUpdated: string;
  comparison: 'up' | 'down' | 'stable';
  changePercentage: number;
}

export interface GovScheme {
  id: string;
  name: string;
  nameHi?: string;
  nameMr?: string;
  ministry: string;
  eligibility: string;
  benefits: string;
  howToApply: string;
  website: string;
  subsidyPercentage?: string;
}

export interface CropAdvice {
  practices: string[];
  irrigation: string;
  fertilizers: string[];
  pests: string[];
}

export interface DiseaseResult {
  detected: boolean;
  diseaseName: string;
  confidenceScore: number;
  treatment: string[];
  preventiveMeasures: string[];
}

export interface SmartAlert {
  id: string;
  type: 'irrigation' | 'fertilizer' | 'harvesting' | 'disease' | 'market';
  title: string;
  message: string;
  date: string;
  dueDate: string;
  crop?: string;
  completed: boolean;
}

export interface AgenticQueryResponse {
  query: string;
  plannerOutcome: string;
  logs: AgentLog[];
  cropAdvice?: CropAdvice;
  diseaseResult?: DiseaseResult;
  weatherInfo?: WeatherData;
  marketPrices?: MarketPrice[];
  schemes?: GovScheme[];
  finalRecommendation: string;
}
