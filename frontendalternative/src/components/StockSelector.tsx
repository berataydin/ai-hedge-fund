import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Alert,
  FormHelperText,
} from '@mui/material';
import { debounce } from 'lodash';
import { Stock } from '../types';
import { searchStocks, getCompanyFacts } from '../services/api';

interface StockSelectorProps {
  selectedStocks: Stock[];
  onChange: (stocks: Stock[]) => void;
  error?: string;
  maxSelections?: number;
}

const StockSelector: React.FC<StockSelectorProps> = ({
  selectedStocks,
  onChange,
  error,
  maxSelections = 5,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 1) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        // First try to search for stocks
        let results = await searchStocks(query);
        
        // If no results and query looks like a ticker, try to get company facts
        if (results.length === 0 && query.length <= 5) {
          const facts = await getCompanyFacts(query.toUpperCase());
          if (facts) {
            results = [{
              ticker: facts.ticker,
              name: facts.name,
              exchange: facts.exchange,
              sector: facts.sector,
              industry: facts.industry,
            }];
          }
        }
        
        // Filter out already selected stocks
        const filteredResults = results.filter(
          stock => !selectedStocks.some(selected => selected.ticker === stock.ticker)
        );
        
        setSearchResults(filteredResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [selectedStocks]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleStockSelect = (stock: Stock) => {
    if (selectedStocks.length >= maxSelections) {
      return;
    }
    
    const newSelectedStocks = [...selectedStocks, stock];
    onChange(newSelectedStocks);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleStockRemove = (tickerToRemove: string) => {
    const newSelectedStocks = selectedStocks.filter(
      stock => stock.ticker !== tickerToRemove
    );
    onChange(newSelectedStocks);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Stocks (Max {maxSelections})
      </Typography>
      
      {selectedStocks.length >= maxSelections && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Maximum of {maxSelections} stocks can be selected.
        </Alert>
      )}

      {/* Selected Stocks */}
      {selectedStocks.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Stocks:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedStocks.map((stock) => (
              <Chip
                key={stock.ticker}
                label={`${stock.ticker} - ${stock.name}`}
                onDelete={() => handleStockRemove(stock.ticker)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Search Input */}
      <Box sx={{ position: 'relative' }}>
        <TextField
          fullWidth
          label="Search stocks by ticker or company name"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={selectedStocks.length >= maxSelections}
          error={!!error}
          InputProps={{
            endAdornment: isSearching && <CircularProgress size={20} />,
          }}
          placeholder="e.g., AAPL, Apple, Microsoft..."
        />
        
        {error && <FormHelperText error>{error}</FormHelperText>}

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              maxHeight: 300,
              overflow: 'auto',
            }}
          >
            <List dense>
              {searchResults.map((stock) => (
                <ListItem key={stock.ticker} disablePadding>
                  <ListItemButton
                    onClick={() => handleStockSelect(stock)}
                    disabled={selectedStocks.length >= maxSelections}
                  >
                    <ListItemText
                      primary={`${stock.ticker} - ${stock.name}`}
                      secondary={
                        stock.sector || stock.industry
                          ? `${stock.sector || ''}${stock.sector && stock.industry ? ' • ' : ''}${stock.industry || ''}`
                          : stock.exchange
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {showResults && searchQuery && searchResults.length === 0 && !isSearching && (
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              p: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No stocks found for "{searchQuery}"
            </Typography>
          </Paper>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {selectedStocks.length}/{maxSelections} stocks selected
      </Typography>
    </Box>
  );
};

export default StockSelector;
