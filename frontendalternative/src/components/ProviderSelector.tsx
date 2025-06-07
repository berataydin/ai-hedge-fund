import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Alert,
} from '@mui/material';
import { Cloud, Computer, Storage } from '@mui/icons-material';
import { LLMProvider } from '../types';

interface ProviderSelectorProps {
  providers: LLMProvider[];
  selectedProvider: string;
  onChange: (provider: string) => void;
  error?: string;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  providers,
  selectedProvider,
  onChange,
  error,
}) => {
  const getProviderIcon = (providerId: string) => {
    switch (providerId.toLowerCase()) {
      case 'ollama':
      case 'lmstudio':
        return <Computer fontSize="small" />;
      case 'openai':
      case 'anthropic':
      case 'groq':
      case 'gemini':
      case 'deepseek':
        return <Cloud fontSize="small" />;
      default:
        return <Storage fontSize="small" />;
    }
  };

  const getProviderType = (providerId: string) => {
    switch (providerId.toLowerCase()) {
      case 'ollama':
      case 'lmstudio':
        return 'Local';
      case 'openai':
      case 'anthropic':
      case 'groq':
      case 'gemini':
      case 'deepseek':
        return 'Cloud';
      default:
        return 'Unknown';
    }
  };

  const getProviderDescription = (providerId: string) => {
    switch (providerId.toLowerCase()) {
      case 'openai':
        return 'GPT models from OpenAI';
      case 'anthropic':
        return 'Claude models from Anthropic';
      case 'groq':
        return 'Fast inference with Groq';
      case 'gemini':
        return 'Google Gemini models';
      case 'deepseek':
        return 'DeepSeek AI models';
      case 'ollama':
        return 'Local models via Ollama';
      case 'lmstudio':
        return 'Local models via LM Studio';
      default:
        return 'AI language model provider';
    }
  };

  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select LLM Provider
      </Typography>

      {/* Selected Provider Info */}
      {selectedProvider && selectedProviderData && (
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={getProviderIcon(selectedProvider)}
            label={`${selectedProviderData.name} (${getProviderType(selectedProvider)})`}
            color="primary"
            variant="outlined"
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {getProviderDescription(selectedProvider)}
          </Typography>
        </Box>
      )}

      {/* Provider Selection */}
      <FormControl fullWidth error={!!error}>
        <InputLabel id="provider-select-label">Choose Provider</InputLabel>
        <Select
          labelId="provider-select-label"
          value={selectedProvider}
          label="Choose Provider"
          onChange={(e) => onChange(e.target.value)}
        >
          {providers.map((provider) => (
            <MenuItem key={provider.id} value={provider.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {getProviderIcon(provider.id)}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {provider.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getProviderDescription(provider.id)} • {getProviderType(provider.id)}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>

      {/* Local Provider Warnings */}
      {selectedProvider === 'Ollama' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Ollama Setup Required:</strong> Make sure Ollama is installed and running locally. 
            The system will wait for models to load into memory before starting analysis.
          </Typography>
        </Alert>
      )}

      {selectedProvider === 'LMStudio' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>LM Studio Setup Required:</strong> Make sure LM Studio is installed and running locally with a model loaded. 
            The system will wait for the model to be ready before starting analysis.
          </Typography>
        </Alert>
      )}

      {/* Cloud Provider Info */}
      {['OpenAI', 'Anthropic', 'Groq', 'Gemini', 'DeepSeek'].includes(selectedProvider) && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>API Key Required:</strong> Make sure you have configured the appropriate API key 
            for {selectedProvider} in your environment variables.
          </Typography>
        </Alert>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Select the AI provider that will power your analysis
      </Typography>
    </Box>
  );
};

export default ProviderSelector;
