from fastapi import APIRouter

from app.backend.routes.hedge_fund import router as hedge_fund_router
from app.backend.routes.health import router as health_router
from app.backend.routes.stocks import router as stocks_router
from app.backend.routes.analysts import router as analysts_router
from app.backend.routes.llm import router as llm_router

# Main API router
api_router = APIRouter()

# Include sub-routers
api_router.include_router(health_router, tags=["health"])
api_router.include_router(hedge_fund_router, tags=["hedge-fund"])
api_router.include_router(stocks_router, tags=["stocks"])
api_router.include_router(analysts_router, tags=["analysts"])
api_router.include_router(llm_router, tags=["llm"])
