#!/usr/bin/env python3
"""
Test script to verify the frontend API endpoints are working correctly.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint, method="GET", data=None):
    """Test an API endpoint and print the result."""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n{'='*60}")
    print(f"Testing {method} {endpoint}")
    print(f"{'='*60}")
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result.get('success', 'N/A')}")
            if 'data' in result:
                data_len = len(result['data']) if isinstance(result['data'], list) else 1
                print(f"Data items: {data_len}")
                if isinstance(result['data'], list) and len(result['data']) > 0:
                    print(f"First item: {json.dumps(result['data'][0], indent=2)}")
                elif isinstance(result['data'], dict):
                    print(f"Data: {json.dumps(result['data'], indent=2)}")
        else:
            print(f"Error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

def main():
    """Run all API tests."""
    print("Testing AI Hedge Fund Frontend API Endpoints")
    print("=" * 60)
    
    # Test health endpoint
    test_endpoint("/health")
    
    # Test analysts endpoint
    test_endpoint("/analysts")
    
    # Test LLM providers endpoint
    test_endpoint("/llm/providers")
    
    # Test LLM models for OpenAI
    test_endpoint("/llm/providers/OpenAI/models")
    
    # Test Ollama status
    test_endpoint("/llm/ollama/status")
    
    # Test LM Studio status
    test_endpoint("/llm/lmstudio/status")
    
    # Test stock search
    test_endpoint("/stocks/search?q=AAPL")
    
    # Test stock facts
    test_endpoint("/stocks/AAPL/facts")
    
    # Test ticker validation
    test_endpoint("/stocks/validate", "POST", {"tickers": ["AAPL", "MSFT", "INVALID"]})
    
    print(f"\n{'='*60}")
    print("API Testing Complete!")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
