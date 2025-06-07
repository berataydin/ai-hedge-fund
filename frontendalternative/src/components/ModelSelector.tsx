import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Refresh, Add } from '@mui/icons-material';
import { LLMModel } from '../types';
import { checkOllamaStatus, checkLMStudioStatus } from '../services/api';

interface ModelSelectorProps {
  models: LLMModel[];
  selectedModel: string;
  onChange: (model: string) => void;
  error?: string;
  provider: string;
  disabled?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onChange,
  error,
  provider,
  disabled = false,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customModelName, setCustomModelName] = useState('');
  const [providerStatus, setProviderStatus] = useState<{
    running: boolean;
    error?: string;
  }>({ running: true });

  useEffect(() => {
    if (provider === 'Ollama' || provider === 'LMStudio') {
      checkProviderStatus();
    }
  }, [provider]);

  const checkProviderStatus = async () => {
    try {
      if (provider === 'Ollama') {
        const status = await checkOllamaStatus();
        setProviderStatus({ running: status.running });
      } else if (provider === 'LMStudio') {
        const status = await checkLMStudioStatus();
        setProviderStatus({ running: status.running });
      }
    } catch (error) {
      setProviderStatus({ 
        running: false, 
        error: `Failed to connect to ${provider}` 
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await checkProviderStatus();
      // Trigger parent to reload models
      window.location.reload(); // Simple approach for now
    } catch (error) {
      console.error('Failed to refresh models:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCustomModel = () => {
    if (customModelName.trim()) {
      onChange(customModelName.trim());
      setShowCustomDialog(false);
      setCustomModelName('');
    }
  };

  const getModelDisplayName = (model: LLMModel) => {
    return model.name || model.id;
  };

  const getModelDescription = (model: LLMModel) => {
    if (model.description) {
      return model.description;
    }
    
    // Generate description based on model name patterns
    const name = model.name.toLowerCase();
    if (name.includes('gpt-4')) return 'Advanced reasoning and analysis';
    if (name.includes('gpt-3.5')) return 'Fast and efficient processing';
    if (name.includes('claude')) return 'Thoughtful analysis and reasoning';
    if (name.includes('gemini')) return 'Multimodal AI capabilities';
    if (name.includes('llama')) return 'Open-source language model';
    if (name.includes('mistral')) return 'Efficient European AI model';
    
    return 'AI language model';
  };

  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Model
      </Typography>

      {/* Provider Status */}
      {(provider === 'Ollama' || provider === 'LMStudio') && !providerStatus.running && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {providerStatus.error || `${provider} is not running or not accessible.`}
            <br />
            Please start {provider} and ensure it's properly configured.
          </Typography>
        </Alert>
      )}

      {/* Selected Model Info */}
      {selectedModel && selectedModelData && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={getModelDisplayName(selectedModelData)}
            color="primary"
            variant="outlined"
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {getModelDescription(selectedModelData)}
          </Typography>
        </Box>
      )}

      {/* Model Selection */}
      <FormControl fullWidth error={!!error}>
        <InputLabel id="model-select-label">Choose Model</InputLabel>
        <Select
          labelId="model-select-label"
          value={selectedModel}
          label="Choose Model"
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || !providerStatus.running}
        >
          {models.map((model) => (
            <MenuItem key={model.id} value={model.id}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" fontWeight="medium">
                  {getModelDisplayName(model)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getModelDescription(model)}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          
          {/* Custom Model Option for Ollama/LMStudio */}
          {(provider === 'Ollama' || provider === 'LMStudio') && (
            <MenuItem value="custom" onClick={() => setShowCustomDialog(true)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Add fontSize="small" />
                <Typography variant="body2">
                  Enter custom model name...
                </Typography>
              </Box>
            </MenuItem>
          )}
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>

      {/* Refresh Button for Local Providers */}
      {(provider === 'Ollama' || provider === 'LMStudio') && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleRefresh}
            disabled={isRefreshing}
            startIcon={isRefreshing ? <CircularProgress size={16} /> : <Refresh />}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Models'}
          </Button>
        </Box>
      )}

      {/* No Models Available */}
      {models.length === 0 && provider && providerStatus.running && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            No models available for {provider}. 
            {provider === 'Ollama' && ' Try pulling a model with: ollama pull llama2'}
            {provider === 'LMStudio' && ' Load a model in LM Studio first.'}
          </Typography>
        </Alert>
      )}

      {/* Loading State */}
      {disabled && provider && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="caption" color="text.secondary">
            Loading models for {provider}...
          </Typography>
        </Box>
      )}

      {/* Custom Model Dialog */}
      <Dialog open={showCustomDialog} onClose={() => setShowCustomDialog(false)}>
        <DialogTitle>Enter Custom Model Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Model Name"
            fullWidth
            variant="outlined"
            value={customModelName}
            onChange={(e) => setCustomModelName(e.target.value)}
            placeholder={provider === 'Ollama' ? 'e.g., llama2, mistral' : 'e.g., custom-model-name'}
            helperText={`Enter the exact model name as it appears in ${provider}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCustomModel} 
            variant="contained"
            disabled={!customModelName.trim()}
          >
            Select Model
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {provider ? `Available models for ${provider}` : 'Select a provider first'}
      </Typography>
    </Box>
  );
};

export default ModelSelector;
