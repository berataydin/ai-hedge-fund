"""Utilities for working with LM Studio models"""

import requests
import time
from typing import List
import questionary
from colorama import Fore, Style
import os

# Constants
DEFAULT_LMSTUDIO_URL = "http://localhost:1234"
LMSTUDIO_API_MODELS_ENDPOINT = "/v1/models"


def get_lmstudio_base_url() -> str:
    """Get the LM Studio base URL from environment or use default."""
    return os.getenv("LMSTUDIO_BASE_URL", DEFAULT_LMSTUDIO_URL).rstrip("/v1")


def is_lmstudio_server_running() -> bool:
    """Check if the LM Studio server is running."""
    base_url = get_lmstudio_base_url()
    try:
        response = requests.get(f"{base_url}{LMSTUDIO_API_MODELS_ENDPOINT}", timeout=2)
        return response.status_code == 200
    except requests.RequestException:
        return False


def get_available_models() -> List[str]:
    """Get a list of models available in LM Studio."""
    if not is_lmstudio_server_running():
        return []

    base_url = get_lmstudio_base_url()
    try:
        response = requests.get(f"{base_url}{LMSTUDIO_API_MODELS_ENDPOINT}", timeout=5)
        if response.status_code == 200:
            data = response.json()
            models = data.get("data", [])
            return [model["id"] for model in models if "id" in model]
        return []
    except requests.RequestException:
        return []


def ensure_lmstudio_and_model(model_name: str) -> bool | str:
    """Ensure LM Studio is running and the requested model is available.

    Returns:
        bool: True if model is available, False if there's an error
        str: Selected model name if model_name was "auto-detect"
    """
    base_url = get_lmstudio_base_url()

    # Check if LM Studio server is running
    if not is_lmstudio_server_running():
        print(f"{Fore.RED}LM Studio server is not running.{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Please start LM Studio and make sure the server is running on {base_url}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}You can configure the URL using the LMSTUDIO_BASE_URL environment variable.{Style.RESET_ALL}")
        return False

    # Get available models
    available_models = get_available_models()
    if not available_models:
        print(f"{Fore.RED}No models found in LM Studio.{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Please load a model in LM Studio before proceeding.{Style.RESET_ALL}")
        return False

    # If model_name is "auto-detect", let user choose from available models
    if model_name == "auto-detect":
        print(f"{Fore.GREEN}Found {len(available_models)} model(s) in LM Studio:{Style.RESET_ALL}")
        for i, model in enumerate(available_models, 1):
            print(f"  {i}. {model}")

        # Let user select a model
        choices = [questionary.Choice(model, value=model) for model in available_models]
        selected_model = questionary.select(
            "Select a model from LM Studio:",
            choices=choices,
            style=questionary.Style(
                [
                    ("selected", "fg:green bold"),
                    ("pointer", "fg:green bold"),
                    ("highlighted", "fg:green"),
                    ("answer", "fg:green bold"),
                ]
            ),
        ).ask()

        if not selected_model:
            print(f"{Fore.RED}No model selected.{Style.RESET_ALL}")
            return False

        # Return the selected model name
        return selected_model

    # Check if the specific model is available
    if model_name not in available_models:
        print(f"{Fore.RED}Model '{model_name}' is not available in LM Studio.{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Available models: {', '.join(available_models)}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}Please load the model in LM Studio or select a different model.{Style.RESET_ALL}")
        return False

    print(f"{Fore.GREEN}LM Studio is running and model '{model_name}' is available.{Style.RESET_ALL}")
    return True


def get_model_info(model_name: str) -> dict:
    """Get information about a specific model from LM Studio."""
    if not is_lmstudio_server_running():
        return {}

    base_url = get_lmstudio_base_url()
    try:
        response = requests.get(f"{base_url}{LMSTUDIO_API_MODELS_ENDPOINT}", timeout=5)
        if response.status_code == 200:
            data = response.json()
            models = data.get("data", [])
            for model in models:
                if model.get("id") == model_name:
                    return model
        return {}
    except requests.RequestException:
        return {}


# Add this at the end of the file for command-line usage
if __name__ == "__main__":
    import sys
    import argparse

    parser = argparse.ArgumentParser(description="LM Studio model manager")
    parser.add_argument("--check-server", action="store_true", help="Check if LM Studio server is running")
    parser.add_argument("--list-models", action="store_true", help="List available models")
    parser.add_argument("--check-model", help="Check if model exists")
    args = parser.parse_args()

    if args.check_server:
        if is_lmstudio_server_running():
            print(f"{Fore.GREEN}LM Studio server is running.{Style.RESET_ALL}")
            sys.exit(0)
        else:
            print(f"{Fore.RED}LM Studio server is not running.{Style.RESET_ALL}")
            sys.exit(1)
    elif args.list_models:
        models = get_available_models()
        if models:
            print(f"{Fore.GREEN}Available models:{Style.RESET_ALL}")
            for model in models:
                print(f"  - {model}")
        else:
            print(f"{Fore.RED}No models available or server not running.{Style.RESET_ALL}")
        sys.exit(0)
    elif args.check_model:
        result = ensure_lmstudio_and_model(args.check_model)
        sys.exit(0 if result else 1)
    else:
        print("No action specified. Use --check-server, --list-models, or --check-model.")
        sys.exit(1)
