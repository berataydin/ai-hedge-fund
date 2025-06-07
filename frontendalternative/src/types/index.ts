// Types for the AI Hedge Fund Frontend Application

export interface Stock {
  ticker: string;
  name: string;
  exchange?: string;
  sector?: string;
  industry?: string;
}

export interface Analyst {
  id: string;
  displayName: string;
  description?: string;
}

export interface LLMProvider {
  id: string;
  name: string;
  description?: string;
}

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

export interface AnalysisRequest {
  tickers: string[];
  selectedAnalysts: string[];
  modelProvider: string;
  modelName: string;
  startDate?: string;
  endDate?: string;
  initialCash?: number;
  marginRequirement?: number;
}

export interface AnalysisProgress {
  agentName: string;
  ticker: string | null;
  status: string;
  timestamp: string;
}

export interface AnalystSignal {
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reasoning: string;
}

export interface TradingDecision {
  action: 'buy' | 'sell' | 'short' | 'cover' | 'hold';
  quantity: number;
  confidence: number;
  reasoning: string;
}

export interface AnalysisResult {
  decisions: Record<string, TradingDecision>;
  analystSignals: Record<string, Record<string, AnalystSignal>>;
}

export interface AnalysisState {
  isRunning: boolean;
  progress: AnalysisProgress[];
  result: AnalysisResult | null;
  error: string | null;
  cancelFunction?: () => void;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CompanyFacts {
  ticker: string;
  name: string;
  cik?: string;
  industry?: string;
  sector?: string;
  category?: string;
  exchange?: string;
  isActive?: boolean;
  listingDate?: string;
  location?: string;
  marketCap?: number;
  numberOfEmployees?: number;
  secFilingsUrl?: string;
  sicCode?: string;
  sicIndustry?: string;
  sicSector?: string;
  websiteUrl?: string;
  weightedAverageShares?: number;
}

// Form validation types
export interface FormErrors {
  stocks?: string;
  analysts?: string;
  provider?: string;
  model?: string;
}

export interface FormData {
  selectedStocks: Stock[];
  selectedAnalysts: string[];
  selectedProvider: string;
  selectedModel: string;
  startDate: string;
  endDate: string;
  initialCash: number;
  marginRequirement: number;
}
