#!/usr/bin/env python3
"""
Simple script to run the FastAPI backend server.
Usage: python run_backend.py
"""

import uvicorn
import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

if __name__ == "__main__":
    uvicorn.run(
        "project_planner.backend:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    ) 