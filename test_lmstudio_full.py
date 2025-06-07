#!/usr/bin/env python3
"""Test LM Studio integration with the full hedge fund workflow"""

import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from main import run_hedge_fund
from utils.lmstudio import get_available_models

def test_lmstudio_hedge_fund():
    """Test the hedge fund with LM Studio"""
    print("Testing LM Studio integration with hedge fund...")
    
    # Get available models
    models = get_available_models()
    if not models:
        print("❌ No LM Studio models available")
        return False
    
    test_model = models[0]
    print(f"Using model: {test_model}")
    
    # Test portfolio
    portfolio = {
        "cash": 100000.0,
        "margin_requirement": 0.0,
        "margin_used": 0.0,
        "positions": {
            "AAPL": {
                "long": 0,
                "short": 0,
                "long_cost_basis": 0.0,
                "short_cost_basis": 0.0,
                "short_margin_used": 0.0,
            }
        },
        "realized_gains": {
            "AAPL": {
                "long": 0.0,
                "short": 0.0,
            }
        },
    }
    
    try:
        # Run the hedge fund with LM Studio
        result = run_hedge_fund(
            tickers=["AAPL"],
            start_date="2024-01-01",
            end_date="2024-01-31",
            portfolio=portfolio,
            show_reasoning=False,
            selected_analysts=["aswath_damodaran"],  # Use just one analyst for testing
            model_name=test_model,
            model_provider="LMStudio",
        )
        
        print("✅ Hedge fund run completed successfully!")
        
        # Check the results
        if "decisions" in result and "analyst_signals" in result:
            decisions = result["decisions"]
            signals = result["analyst_signals"]
            
            print(f"Decisions: {decisions}")
            print(f"Analyst signals: {list(signals.keys())}")
            
            # Check if we got valid decisions for AAPL
            if "AAPL" in decisions:
                aapl_decision = decisions["AAPL"]
                if "action" in aapl_decision and "quantity" in aapl_decision:
                    print(f"✅ Valid decision for AAPL: {aapl_decision['action']} {aapl_decision['quantity']}")
                    return True
                else:
                    print(f"❌ Invalid decision structure: {aapl_decision}")
                    return False
            else:
                print("❌ No decision found for AAPL")
                return False
        else:
            print(f"❌ Invalid result structure: {result}")
            return False
            
    except Exception as e:
        print(f"❌ Error running hedge fund: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_lmstudio_hedge_fund()
    if success:
        print("\n🎉 LM Studio integration test passed!")
        sys.exit(0)
    else:
        print("\n❌ LM Studio integration test failed!")
        sys.exit(1)
