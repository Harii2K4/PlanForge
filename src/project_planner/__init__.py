"""
Project Planner Crew Package

This package contains a CrewAI-based project planning system that helps with:
- Task breakdown and estimation
- Resource allocation
- Project milestone planning
"""

from .crew import ProjectPlanner
from .models import TaskEstimation, Milestone, ProjectPlan, GanttChartEntry, ProjectPlannerRequest
from .tools.custom_tool import MyCustomTool


__version__ = "0.1.0"
__author__ = "Your Name"

# Expose main components for easy import
__all__ = [
    "ProjectPlanner",
    "TaskEstimation", 
    "Milestone",
    "ProjectPlan",
    "GanttChartEntry",
    "ProjectPlannerRequest",
    "MyCustomTool"
]

# For backward compatibility and convenience
def create_project_planner():
    """
    Factory function to create a ProjectPlanner instance.
    
    Returns:
        ProjectPlanner: A configured ProjectPlanner instance
    """
    return ProjectPlanner()
