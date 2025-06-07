import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  ExpandMore,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Assessment,
} from '@mui/icons-material';
import { FormData, FormErrors, AnalysisState, AnalysisProgress } from '../types';

interface AnalysisPanelProps {
  formData: FormData;
  formErrors: FormErrors;
  analysisState: AnalysisState;
  onStartAnalysis: () => void;
  onCancelAnalysis: () => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  formData,
  formErrors,
  analysisState,
  onStartAnalysis,
  onCancelAnalysis,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const canStartAnalysis = () => {
    return (
      formData.selectedStocks.length > 0 &&
      formData.selectedAnalysts.length > 0 &&
      formData.selectedProvider &&
      formData.selectedModel &&
      !analysisState.isRunning
    );
  };

  const getValidationErrors = () => {
    const errors: string[] = [];
    
    if (formData.selectedStocks.length === 0) {
      errors.push('Please select at least one stock');
    }
    
    if (formData.selectedAnalysts.length === 0) {
      errors.push('Please select at least one analyst');
    }
    
    if (!formData.selectedProvider) {
      errors.push('Please select an LLM provider');
    }
    
    if (!formData.selectedModel) {
      errors.push('Please select a model');
    }
    
    return errors;
  };

  const getSignalIcon = (signal: string) => {
    switch (signal?.toLowerCase()) {
      case 'bullish':
        return <TrendingUp color="success" />;
      case 'bearish':
        return <TrendingDown color="error" />;
      case 'neutral':
        return <TrendingFlat color="warning" />;
      default:
        return <Assessment />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal?.toLowerCase()) {
      case 'bullish':
        return 'success';
      case 'bearish':
        return 'error';
      case 'neutral':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatProgress = (progress: AnalysisProgress[]) => {
    const latest = progress[progress.length - 1];
    if (!latest) return 'Preparing analysis...';
    
    return `${latest.agentName}: ${latest.status}${latest.ticker ? ` (${latest.ticker})` : ''}`;
  };

  const validationErrors = getValidationErrors();

  return (
    <Paper elevation={3} sx={{ p: 3, height: 'fit-content' }}>
      <Typography variant="h5" gutterBottom>
        Analysis Control
      </Typography>

      {/* Configuration Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Configuration
        </Typography>
        
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Stocks ({formData.selectedStocks.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {formData.selectedStocks.slice(0, 3).map(stock => (
                <Chip key={stock.ticker} label={stock.ticker} size="small" />
              ))}
              {formData.selectedStocks.length > 3 && (
                <Chip label={`+${formData.selectedStocks.length - 3}`} size="small" />
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Analysts ({formData.selectedAnalysts.length})
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {formData.selectedAnalysts.length > 0
                ? `${formData.selectedAnalysts.length} selected`
                : 'None selected'
              }
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Provider & Model
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {formData.selectedProvider && formData.selectedModel
                ? `${formData.selectedProvider} - ${formData.selectedModel}`
                : 'Not configured'
              }
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Date Range
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {formData.startDate} to {formData.endDate}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Advanced Settings */}
      <Accordion expanded={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Advanced Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Initial Cash"
                type="number"
                value={formData.initialCash}
                onChange={(e) => {
                  // This would be handled by parent component
                }}
                InputProps={{
                  startAdornment: '$',
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Margin Requirement"
                type="number"
                value={formData.marginRequirement}
                onChange={(e) => {
                  // This would be handled by parent component
                }}
                InputProps={{
                  startAdornment: '$',
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  // This would be handled by parent component
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => {
                  // This would be handled by parent component
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Please fix the following issues:
          </Typography>
          <List dense>
            {validationErrors.map((error, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemText primary={`• ${error}`} />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* Analysis Controls */}
      <Box sx={{ mt: 3 }}>
        {!analysisState.isRunning ? (
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<PlayArrow />}
            onClick={onStartAnalysis}
            disabled={!canStartAnalysis()}
          >
            Start Analysis
          </Button>
        ) : (
          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<Stop />}
            onClick={onCancelAnalysis}
            color="error"
          >
            Cancel Analysis
          </Button>
        )}
      </Box>

      {/* Progress Display */}
      {analysisState.isRunning && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Analysis in Progress
          </Typography>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            {formatProgress(analysisState.progress)}
          </Typography>
        </Box>
      )}

      {/* Error Display */}
      {analysisState.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Analysis Failed</Typography>
          <Typography variant="body2">{analysisState.error}</Typography>
        </Alert>
      )}

      {/* Results Display */}
      {analysisState.result && !analysisState.isRunning && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Analysis Results
          </Typography>
          
          {/* Trading Decisions */}
          {analysisState.result.decisions && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Trading Decisions
                </Typography>
                {Object.entries(analysisState.result.decisions).map(([ticker, decision]) => (
                  <Box key={ticker} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">{ticker}:</Typography>
                      <Chip 
                        label={`${decision.action.toUpperCase()} ${decision.quantity}`}
                        color={decision.action === 'buy' ? 'success' : decision.action === 'sell' ? 'error' : 'default'}
                        size="small"
                      />
                      <Typography variant="caption">
                        ({Math.round(decision.confidence)}% confidence)
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Analyst Signals */}
          {analysisState.result.analystSignals && (
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Analyst Signals
                </Typography>
                {Object.entries(analysisState.result.analystSignals).map(([analyst, signals]) => (
                  <Accordion key={analyst}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle2">{analyst}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {Object.entries(signals).map(([ticker, signal]) => (
                        <Box key={ticker} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getSignalIcon(signal.signal)}
                            <Typography variant="body2">{ticker}:</Typography>
                            <Chip 
                              label={signal.signal}
                              color={getSignalColor(signal.signal) as any}
                              size="small"
                            />
                            <Typography variant="caption">
                              ({Math.round(signal.confidence)}%)
                            </Typography>
                          </Box>
                          {signal.reasoning && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block' }}>
                              {signal.reasoning}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default AnalysisPanel;
