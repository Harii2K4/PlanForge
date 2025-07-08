"""
Project Progres Crew Package

This package contains a CrewAI-based project progress system that helps with:
- Project progress tracking
- Reporting
- Analysis
"""

from .crew import ProjectProgres
from .tools.custom_tool import TrelloBoardDataFetcherTool, TrelloCardDataFetcherTool, TrelloUserDataFetcherTool


__all__ = ["ProjectProgres", "TrelloBoardDataFetcherTool", "TrelloCardDataFetcherTool", "TrelloUserDataFetcherTool", "data_collection_agent", "analysis_agent", "data_collection_task", "data_analysis_task", "report_generation_task"]

