from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import requests
import os
from pydantic import BaseModel

from src.tools.api import get_market_cap
from src.data.models import CompanyFactsResponse

router = APIRouter(prefix="/stocks")


class StockSearchResult(BaseModel):
    ticker: str
    name: str
    exchange: Optional[str] = None
    sector: Optional[str] = None
    industry: Optional[str] = None


class TickerValidationRequest(BaseModel):
    tickers: List[str]


class TickerValidationResponse(BaseModel):
    valid: List[str]
    invalid: List[str]


# Popular stocks for quick search
POPULAR_STOCKS = [
    {"ticker": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ", "sector": "Technology"},
    {"ticker": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ", "sector": "Technology"},
    {"ticker": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ", "sector": "Technology"},
    {"ticker": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ", "sector": "Consumer Discretionary"},
    {"ticker": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ", "sector": "Consumer Discretionary"},
    {"ticker": "META", "name": "Meta Platforms Inc.", "exchange": "NASDAQ", "sector": "Technology"},
    {"ticker": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ", "sector": "Technology"},
    {"ticker": "JPM", "name": "JPMorgan Chase & Co.", "exchange": "NYSE", "sector": "Financial Services"},
    {"ticker": "JNJ", "name": "Johnson & Johnson", "exchange": "NYSE", "sector": "Healthcare"},
    {"ticker": "V", "name": "Visa Inc.", "exchange": "NYSE", "sector": "Financial Services"},
    {"ticker": "PG", "name": "Procter & Gamble Co.", "exchange": "NYSE", "sector": "Consumer Staples"},
    {"ticker": "UNH", "name": "UnitedHealth Group Inc.", "exchange": "NYSE", "sector": "Healthcare"},
    {"ticker": "HD", "name": "Home Depot Inc.", "exchange": "NYSE", "sector": "Consumer Discretionary"},
    {"ticker": "MA", "name": "Mastercard Inc.", "exchange": "NYSE", "sector": "Financial Services"},
    {"ticker": "BAC", "name": "Bank of America Corp.", "exchange": "NYSE", "sector": "Financial Services"},
    {"ticker": "XOM", "name": "Exxon Mobil Corporation", "exchange": "NYSE", "sector": "Energy"},
    {"ticker": "WMT", "name": "Walmart Inc.", "exchange": "NYSE", "sector": "Consumer Staples"},
    {"ticker": "LLY", "name": "Eli Lilly and Company", "exchange": "NYSE", "sector": "Healthcare"},
    {"ticker": "CVX", "name": "Chevron Corporation", "exchange": "NYSE", "sector": "Energy"},
    {"ticker": "ABBV", "name": "AbbVie Inc.", "exchange": "NYSE", "sector": "Healthcare"},
]


@router.get("/search")
async def search_stocks(q: str = Query(..., min_length=1, description="Search query")):
    """Search for stocks by ticker or company name."""
    try:
        query = q.lower().strip()
        results = []
        
        # Search in popular stocks first
        for stock in POPULAR_STOCKS:
            if (query in stock["ticker"].lower() or 
                query in stock["name"].lower()):
                results.append(StockSearchResult(**stock))
        
        # If we have enough results, return them
        if len(results) >= 10:
            return {"success": True, "data": results[:10]}
        
        # For now, return popular stocks results
        # In a real implementation, you would integrate with a stock search API
        return {"success": True, "data": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/{ticker}/facts")
async def get_stock_facts(ticker: str):
    """Get company facts for a specific ticker."""
    try:
        # Use the existing API function
        headers = {}
        if api_key := os.environ.get("FINANCIAL_DATASETS_API_KEY"):
            headers["X-API-KEY"] = api_key

        url = f"https://api.financialdatasets.ai/company/facts/?ticker={ticker.upper()}"
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail=f"Company facts not found for {ticker}")

        data = response.json()
        response_model = CompanyFactsResponse(**data)
        
        return {
            "success": True, 
            "data": {
                "ticker": response_model.company_facts.ticker,
                "name": response_model.company_facts.name,
                "exchange": response_model.company_facts.exchange,
                "sector": response_model.company_facts.sector,
                "industry": response_model.company_facts.industry,
                "marketCap": response_model.company_facts.market_cap,
                "numberOfEmployees": response_model.company_facts.number_of_employees,
                "websiteUrl": response_model.company_facts.website_url,
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch company facts: {str(e)}")


@router.post("/validate")
async def validate_tickers(request: TickerValidationRequest):
    """Validate a list of ticker symbols."""
    try:
        valid_tickers = []
        invalid_tickers = []
        
        for ticker in request.tickers:
            try:
                # Try to get company facts to validate ticker
                headers = {}
                if api_key := os.environ.get("FINANCIAL_DATASETS_API_KEY"):
                    headers["X-API-KEY"] = api_key

                url = f"https://api.financialdatasets.ai/company/facts/?ticker={ticker.upper()}"
                response = requests.get(url, headers=headers, timeout=5)
                
                if response.status_code == 200:
                    valid_tickers.append(ticker.upper())
                else:
                    invalid_tickers.append(ticker.upper())
                    
            except Exception:
                invalid_tickers.append(ticker.upper())
        
        return {
            "success": True,
            "data": TickerValidationResponse(
                valid=valid_tickers,
                invalid=invalid_tickers
            )
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")
