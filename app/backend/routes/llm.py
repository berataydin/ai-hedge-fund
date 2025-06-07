from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel

from src.llm.models import LLM_ORDER, OLLAMA_LLM_ORDER, LMSTUDIO_LLM_ORDER, ModelProvider
from src.utils.ollama import is_ollama_server_running, get_locally_available_models as get_ollama_models
from src.utils.lmstudio import is_lmstudio_server_running, get_available_models as get_lmstudio_models

router = APIRouter(prefix="/llm")


class LLMProviderInfo(BaseModel):
    id: str
    name: str
    description: str


class LLMModelInfo(BaseModel):
    id: str
    name: str
    provider: str
    description: str


class ProviderStatusResponse(BaseModel):
    running: bool
    models: List[str]


@router.get("/providers")
async def get_available_providers():
    """Get list of available LLM providers."""
    try:
        providers = [
            LLMProviderInfo(
                id="OpenAI",
                name="OpenAI",
                description="GPT models from OpenAI"
            ),
            LLMProviderInfo(
                id="Anthropic",
                name="Anthropic",
                description="Claude models from Anthropic"
            ),
            LLMProviderInfo(
                id="Groq",
                name="Groq",
                description="Fast inference with Groq"
            ),
            LLMProviderInfo(
                id="Gemini",
                name="Google Gemini",
                description="Google Gemini models"
            ),
            LLMProviderInfo(
                id="DeepSeek",
                name="DeepSeek",
                description="DeepSeek AI models"
            ),
            LLMProviderInfo(
                id="Ollama",
                name="Ollama",
                description="Local models via Ollama"
            ),
            LLMProviderInfo(
                id="LMStudio",
                name="LM Studio",
                description="Local models via LM Studio"
            ),
        ]
        
        return {
            "success": True,
            "data": [provider.dict() for provider in providers]
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to fetch providers: {str(e)}"
        }


@router.get("/providers/{provider}/models")
async def get_provider_models(provider: str):
    """Get available models for a specific provider."""
    try:
        models = []
        
        if provider == "OpenAI":
            # Filter LLM_ORDER for OpenAI models
            for display, name, provider_name in LLM_ORDER:
                if provider_name == ModelProvider.OPENAI:
                    models.append(LLMModelInfo(
                        id=name,
                        name=display,
                        provider="OpenAI",
                        description="OpenAI GPT model"
                    ))
        
        elif provider == "Anthropic":
            for display, name, provider_name in LLM_ORDER:
                if provider_name == ModelProvider.ANTHROPIC:
                    models.append(LLMModelInfo(
                        id=name,
                        name=display,
                        provider="Anthropic",
                        description="Anthropic Claude model"
                    ))
        
        elif provider == "Groq":
            for display, name, provider_name in LLM_ORDER:
                if provider_name == ModelProvider.GROQ:
                    models.append(LLMModelInfo(
                        id=name,
                        name=display,
                        provider="Groq",
                        description="Groq-accelerated model"
                    ))
        
        elif provider == "Gemini":
            for display, name, provider_name in LLM_ORDER:
                if provider_name == ModelProvider.GEMINI:
                    models.append(LLMModelInfo(
                        id=name,
                        name=display,
                        provider="Gemini",
                        description="Google Gemini model"
                    ))
        
        elif provider == "DeepSeek":
            for display, name, provider_name in LLM_ORDER:
                if provider_name == ModelProvider.DEEPSEEK:
                    models.append(LLMModelInfo(
                        id=name,
                        name=display,
                        provider="DeepSeek",
                        description="DeepSeek AI model"
                    ))
        
        elif provider == "Ollama":
            # Get models from Ollama
            if is_ollama_server_running():
                ollama_models = get_ollama_models()
                for model_name in ollama_models:
                    models.append(LLMModelInfo(
                        id=model_name,
                        name=model_name,
                        provider="Ollama",
                        description="Local Ollama model"
                    ))
        
        elif provider == "LMStudio":
            # Get models from LM Studio
            if is_lmstudio_server_running():
                lmstudio_models = get_lmstudio_models()
                for model_name in lmstudio_models:
                    models.append(LLMModelInfo(
                        id=model_name,
                        name=model_name,
                        provider="LMStudio",
                        description="Local LM Studio model"
                    ))
        
        return {
            "success": True,
            "data": [model.dict() for model in models]
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to fetch models for {provider}: {str(e)}"
        }


@router.get("/ollama/status")
async def get_ollama_status():
    """Check Ollama status and available models."""
    try:
        running = is_ollama_server_running()
        models = get_ollama_models() if running else []
        
        return {
            "success": True,
            "data": ProviderStatusResponse(
                running=running,
                models=models
            ).dict()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to check Ollama status: {str(e)}"
        }


@router.get("/lmstudio/status")
async def get_lmstudio_status():
    """Check LM Studio status and available models."""
    try:
        running = is_lmstudio_server_running()
        models = get_lmstudio_models() if running else []
        
        return {
            "success": True,
            "data": ProviderStatusResponse(
                running=running,
                models=models
            ).dict()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to check LM Studio status: {str(e)}"
        }
