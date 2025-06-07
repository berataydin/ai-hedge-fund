import axios from 'axios';
import { 
  Stock, 
  Analyst, 
  LLMProvider, 
  LLMModel, 
  AnalysisRequest, 
  AnalysisResult,
  CompanyFacts,
  ApiResponse 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Stock-related API calls
export const searchStocks = async (query: string): Promise<Stock[]> => {
  try {
    const response = await api.get(`/stocks/search?q=${encodeURIComponent(query)}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
};

export const getCompanyFacts = async (ticker: string): Promise<CompanyFacts | null> => {
  try {
    const response = await api.get(`/stocks/${ticker}/facts`);
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching company facts:', error);
    return null;
  }
};

export const validateTickers = async (tickers: string[]): Promise<{ valid: string[], invalid: string[] }> => {
  try {
    const response = await api.post('/stocks/validate', { tickers });
    return response.data.data || { valid: [], invalid: tickers };
  } catch (error) {
    console.error('Error validating tickers:', error);
    return { valid: [], invalid: tickers };
  }
};

// Analyst-related API calls
export const getAvailableAnalysts = async (): Promise<Analyst[]> => {
  try {
    const response = await api.get('/analysts');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching analysts:', error);
    return [];
  }
};

// LLM Provider and Model API calls
export const getAvailableProviders = async (): Promise<LLMProvider[]> => {
  try {
    const response = await api.get('/llm/providers');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching LLM providers:', error);
    return [];
  }
};

export const getAvailableModels = async (provider: string): Promise<LLMModel[]> => {
  try {
    const response = await api.get(`/llm/providers/${provider}/models`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching models for provider:', error);
    return [];
  }
};

export const checkOllamaStatus = async (): Promise<{ running: boolean, models: string[] }> => {
  try {
    const response = await api.get('/llm/ollama/status');
    return response.data.data || { running: false, models: [] };
  } catch (error) {
    console.error('Error checking Ollama status:', error);
    return { running: false, models: [] };
  }
};

export const checkLMStudioStatus = async (): Promise<{ running: boolean, models: string[] }> => {
  try {
    const response = await api.get('/llm/lmstudio/status');
    return response.data.data || { running: false, models: [] };
  } catch (error) {
    console.error('Error checking LM Studio status:', error);
    return { running: false, models: [] };
  }
};

// Analysis API calls
export const runAnalysis = (
  request: AnalysisRequest,
  onProgress: (progress: any) => void,
  onComplete: (result: AnalysisResult) => void,
  onError: (error: string) => void
): () => void => {
  const controller = new AbortController();
  
  const runStream = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hedge-fund/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tickers: request.tickers,
          selected_agents: request.selectedAnalysts,
          model_name: request.modelName,
          model_provider: request.modelProvider,
          start_date: request.startDate,
          end_date: request.endDate,
          initial_cash: request.initialCash || 100000,
          margin_requirement: request.marginRequirement || 0,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                onProgress(data);
              } else if (data.type === 'complete') {
                onComplete(data.result);
                return;
              } else if (data.type === 'error') {
                onError(data.message || 'Analysis failed');
                return;
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Analysis cancelled');
      } else {
        console.error('Analysis error:', error);
        onError(error.message || 'Analysis failed');
      }
    }
  };

  runStream();

  // Return cancel function
  return () => {
    controller.abort();
  };
};

export default api;
