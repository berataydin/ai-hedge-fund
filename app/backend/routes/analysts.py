from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

from src.utils.analysts import ANALYST_CONFIG

router = APIRouter(prefix="/analysts")


class AnalystInfo(BaseModel):
    id: str
    displayName: str
    description: str


@router.get("", response_model=dict)
async def get_available_analysts():
    """Get list of available AI analysts."""
    try:
        analysts = []
        
        # Convert ANALYST_CONFIG to API response format
        for analyst_id, config in ANALYST_CONFIG.items():
            # Generate descriptions for each analyst
            descriptions = {
                "aswath_damodaran": "NYU professor known for valuation expertise and DCF analysis",
                "ben_graham": "Father of value investing, focuses on intrinsic value and margin of safety",
                "bill_ackman": "Activist investor specializing in concentrated positions and corporate governance",
                "cathie_wood": "Growth investor focused on disruptive innovation and technology trends",
                "charlie_munger": "Warren Buffett's partner, emphasizes quality businesses and rational thinking",
                "michael_burry": "Contrarian investor famous for predicting market bubbles and deep value analysis",
                "peter_lynch": "Growth at reasonable price (GARP) strategy and consumer-focused investing",
                "phil_fisher": "Growth investing pioneer focusing on superior companies with strong management",
                "rakesh_jhunjhunwala": "Indian Warren Buffett, long-term value investing with growth potential",
                "ray_dalio": "Macro-economic analysis and risk parity investment strategies",
                "stanley_druckenmiller": "Macro trader focusing on asymmetric risk-reward opportunities",
                "warren_buffett": "Value investing legend emphasizing quality businesses at fair prices",
                "technicals_analyst": "Technical analysis using price patterns, indicators, and market momentum",
                "fundamentals_analyst": "Fundamental analysis of financial statements and business metrics",
                "sentiment_analyst": "Market sentiment analysis using news, social media, and investor behavior",
                "valuation_analyst": "Comprehensive valuation using multiple methodologies and metrics",
            }
            
            analyst = AnalystInfo(
                id=analyst_id,
                displayName=config["display_name"],
                description=descriptions.get(analyst_id, "AI analyst specializing in investment analysis")
            )
            analysts.append(analyst)
        
        # Sort by order
        analysts.sort(key=lambda x: ANALYST_CONFIG[x.id]["order"])
        
        return {
            "success": True,
            "data": [analyst.dict() for analyst in analysts]
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to fetch analysts: {str(e)}"
        }
