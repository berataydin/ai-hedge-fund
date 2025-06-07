import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Chip,
  FormHelperText,
  Collapse,
  Paper,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { Analyst } from '../types';

interface AnalystSelectorProps {
  analysts: Analyst[];
  selectedAnalysts: string[];
  onChange: (analysts: string[]) => void;
  error?: string;
}

const AnalystSelector: React.FC<AnalystSelectorProps> = ({
  analysts,
  selectedAnalysts,
  onChange,
  error,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleAnalystToggle = (analystId: string) => {
    const newSelected = selectedAnalysts.includes(analystId)
      ? selectedAnalysts.filter(id => id !== analystId)
      : [...selectedAnalysts, analystId];
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedAnalysts.length === analysts.length) {
      onChange([]);
    } else {
      onChange(analysts.map(analyst => analyst.id));
    }
  };

  const handleSelectNone = () => {
    onChange([]);
  };

  const getAnalystName = (analystId: string) => {
    const analyst = analysts.find(a => a.id === analystId);
    return analyst ? analyst.displayName : analystId;
  };

  const allSelected = selectedAnalysts.length === analysts.length;
  const someSelected = selectedAnalysts.length > 0 && selectedAnalysts.length < analysts.length;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select AI Analysts
      </Typography>

      {/* Selected Analysts Summary */}
      {selectedAnalysts.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Analysts ({selectedAnalysts.length}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {selectedAnalysts.slice(0, 3).map((analystId) => (
              <Chip
                key={analystId}
                label={getAnalystName(analystId)}
                size="small"
                color="primary"
                variant="outlined"
                onDelete={() => handleAnalystToggle(analystId)}
              />
            ))}
            {selectedAnalysts.length > 3 && (
              <Chip
                label={`+${selectedAnalysts.length - 3} more`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      )}

      {/* Expand/Collapse Button */}
      <Button
        variant="outlined"
        onClick={() => setExpanded(!expanded)}
        endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
        fullWidth
        sx={{ mb: 2 }}
      >
        {expanded ? 'Hide' : 'Show'} Analyst Selection
      </Button>

      {/* Analyst Selection Panel */}
      <Collapse in={expanded}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          {/* Select All/None Controls */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant={allSelected ? "contained" : "outlined"}
              onClick={handleSelectAll}
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={handleSelectNone}
              disabled={selectedAnalysts.length === 0}
            >
              Clear Selection
            </Button>
          </Box>

          {/* Analyst Checkboxes */}
          <FormControl component="fieldset" error={!!error} fullWidth>
            <FormLabel component="legend">
              Choose the AI analysts you want to include in your analysis:
            </FormLabel>
            <FormGroup>
              {analysts.map((analyst) => (
                <FormControlLabel
                  key={analyst.id}
                  control={
                    <Checkbox
                      checked={selectedAnalysts.includes(analyst.id)}
                      onChange={() => handleAnalystToggle(analyst.id)}
                      name={analyst.id}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {analyst.displayName}
                      </Typography>
                      {analyst.description && (
                        <Typography variant="caption" color="text.secondary">
                          {analyst.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              ))}
            </FormGroup>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        </Paper>
      </Collapse>

      {/* Quick Selection Presets */}
      {!expanded && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Quick Presets:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const valueInvestors = analysts
                  .filter(a => ['warren_buffett', 'ben_graham', 'charlie_munger'].includes(a.id))
                  .map(a => a.id);
                onChange(valueInvestors);
              }}
            >
              Value Investors
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const growthInvestors = analysts
                  .filter(a => ['cathie_wood', 'peter_lynch', 'phil_fisher'].includes(a.id))
                  .map(a => a.id);
                onChange(growthInvestors);
              }}
            >
              Growth Investors
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const technicalAnalysts = analysts
                  .filter(a => ['technicals_analyst', 'sentiment_analyst'].includes(a.id))
                  .map(a => a.id);
                onChange(technicalAnalysts);
              }}
            >
              Technical Analysis
            </Button>
          </Box>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {selectedAnalysts.length} analyst{selectedAnalysts.length !== 1 ? 's' : ''} selected
      </Typography>
    </Box>
  );
};

export default AnalystSelector;
