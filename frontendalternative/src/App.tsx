import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  AppBar,
  Toolbar,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import StockSelector from './components/StockSelector';
import AnalystSelector from './components/AnalystSelector';
import ProviderSelector from './components/ProviderSelector';
import ModelSelector from './components/ModelSelector';
import AnalysisPanel from './components/AnalysisPanel';
import {
  Stock,
  Analyst,
  LLMProvider,
  LLMModel,
  FormData,
  FormErrors,
  AnalysisState
} from './types';
import {
  getAvailableAnalysts,
  getAvailableProviders,
  getAvailableModels,
  checkOllamaStatus,
  checkLMStudioStatus,
  runAnalysis
} from './services/api';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function App() {
  const [formData, setFormData] = useState<FormData>({
    selectedStocks: [],
    selectedAnalysts: [],
    selectedProvider: '',
    selectedModel: '',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    initialCash: 100000,
    marginRequirement: 0,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [models, setModels] = useState<LLMModel[]>([]);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isRunning: false,
    progress: [],
    result: null,
    error: null,
  });

  // Load initial data
  useEffect(() => {
    loadAnalysts();
    loadProviders();
  }, []);

  // Load models when provider changes
  useEffect(() => {
    if (formData.selectedProvider) {
      loadModels(formData.selectedProvider);
    } else {
      setModels([]);
      setFormData(prev => ({ ...prev, selectedModel: '' }));
    }
  }, [formData.selectedProvider]);

  const loadAnalysts = async () => {
    try {
      const data = await getAvailableAnalysts();
      setAnalysts(data);
    } catch (error) {
      console.error('Failed to load analysts:', error);
    }
  };

  const loadProviders = async () => {
    try {
      const data = await getAvailableProviders();
      setProviders(data);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const loadModels = async (provider: string) => {
    try {
      let data: LLMModel[] = [];

      if (provider === 'Ollama') {
        const status = await checkOllamaStatus();
        if (status.running) {
          data = status.models.map(model => ({
            id: model,
            name: model,
            provider: 'Ollama',
          }));
        }
      } else if (provider === 'LMStudio') {
        const status = await checkLMStudioStatus();
        if (status.running) {
          data = status.models.map(model => ({
            id: model,
            name: model,
            provider: 'LMStudio',
          }));
        }
      } else {
        data = await getAvailableModels(provider);
      }

      setModels(data);

      // Reset selected model if it's not available in the new provider
      if (formData.selectedModel && !data.find(m => m.id === formData.selectedModel)) {
        setFormData(prev => ({ ...prev, selectedModel: '' }));
      }
    } catch (error) {
      console.error('Failed to load models:', error);
      setModels([]);
    }
  };

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    if (formData.selectedStocks.length === 0) {
      errors.stocks = 'Please select at least one stock';
    }

    if (formData.selectedAnalysts.length === 0) {
      errors.analysts = 'Please select at least one analyst';
    }

    if (!formData.selectedProvider) {
      errors.provider = 'Please select an LLM provider';
    }

    if (!formData.selectedModel) {
      errors.model = 'Please select a model';
    }

    return errors;
  };

  const handleStartAnalysis = () => {
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setAnalysisState(prev => ({
      ...prev,
      isRunning: true,
      progress: [],
      result: null,
      error: null,
    }));

    const analysisRequest = {
      tickers: formData.selectedStocks.map(stock => stock.ticker),
      selectedAnalysts: formData.selectedAnalysts,
      modelProvider: formData.selectedProvider,
      modelName: formData.selectedModel,
      startDate: formData.startDate,
      endDate: formData.endDate,
      initialCash: formData.initialCash,
      marginRequirement: formData.marginRequirement,
    };

    const cancelAnalysis = runAnalysis(
      analysisRequest,
      (progress) => {
        setAnalysisState(prev => ({
          ...prev,
          progress: [...prev.progress, progress],
        }));
      },
      (result) => {
        setAnalysisState(prev => ({
          ...prev,
          isRunning: false,
          result,
        }));
      },
      (error) => {
        setAnalysisState(prev => ({
          ...prev,
          isRunning: false,
          error,
        }));
      }
    );

    // Store cancel function for later use
    setAnalysisState(prev => ({
      ...prev,
      cancelFunction: cancelAnalysis,
    }));
  };

  const handleCancelAnalysis = () => {
    if (analysisState.cancelFunction) {
      analysisState.cancelFunction();
    }
    setAnalysisState(prev => ({
      ...prev,
      isRunning: false,
      cancelFunction: undefined,
    }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <TrendingUp sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Hedge Fund Analysis Platform
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Configuration Panel */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h5" gutterBottom>
                Analysis Configuration
              </Typography>

              <Box sx={{ mt: 3 }}>
                <StockSelector
                  selectedStocks={formData.selectedStocks}
                  onChange={(stocks) => setFormData(prev => ({ ...prev, selectedStocks: stocks }))}
                  error={formErrors.stocks}
                  maxSelections={5}
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <AnalystSelector
                  analysts={analysts}
                  selectedAnalysts={formData.selectedAnalysts}
                  onChange={(analysts) => setFormData(prev => ({ ...prev, selectedAnalysts: analysts }))}
                  error={formErrors.analysts}
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <ProviderSelector
                  providers={providers}
                  selectedProvider={formData.selectedProvider}
                  onChange={(provider) => setFormData(prev => ({ ...prev, selectedProvider: provider }))}
                  error={formErrors.provider}
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <ModelSelector
                  models={models}
                  selectedModel={formData.selectedModel}
                  onChange={(model) => setFormData(prev => ({ ...prev, selectedModel: model }))}
                  error={formErrors.model}
                  provider={formData.selectedProvider}
                  disabled={!formData.selectedProvider || models.length === 0}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Analysis Panel */}
          <Grid size={{ xs: 12, md: 6 }}>
            <AnalysisPanel
              formData={formData}
              formErrors={formErrors}
              analysisState={analysisState}
              onStartAnalysis={handleStartAnalysis}
              onCancelAnalysis={handleCancelAnalysis}
            />
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
