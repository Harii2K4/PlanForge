"""
Global Pydantic Models for Project Planner

This module contains all Pydantic models used across the project planner
to avoid circular imports and provide a central location for data models.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class TaskEstimation(BaseModel):
    """Model for task estimation details"""
    task_name: str = Field(..., description="The name of the task")
    estimated_time_hours: float = Field(..., description="The estimated time in hours for the task")
    resources_required: List[str] = Field(..., description="The resources required for the task")
    dependencies: List[str] = Field(..., description="The dependencies of the task")
    deliverables: List[str] = Field(..., description="The deliverables of the task")
    risks: List[str] = Field(..., description="The risks associated with the task")
    assumptions: List[str] = Field(..., description="The assumptions associated with the task")
    constraints: List[str] = Field(..., description="The constraints associated with the task")


class Milestone(BaseModel):
    """Model for project milestones"""
    milestone_name: str = Field(..., description="The name of the milestone")
    task_name: str = Field(..., description="The name of the task")
    start_date: str = Field(..., description="The start date of the milestone")
    end_date: str = Field(..., description="The end date of the milestone")


class GanttChartEntry(BaseModel):
    """Model for Gantt chart entries"""
    task_name: str = Field(..., description="The name of the task")
    start_week: int = Field(..., description="The week number when the task starts")
    duration_weeks: int = Field(..., description="The duration of the task in weeks")
    dependencies: List[str] = Field(default=[], description="List of dependent tasks")


class ProjectPlan(BaseModel):
    """Main project plan model containing all project data"""
    tasks: List[TaskEstimation] = Field(..., description="The tasks for the project")
    milestones: List[Milestone] = Field(..., description="The milestones for the project")
    gantt_chart: List[GanttChartEntry] = Field(..., description="The Gantt chart data for timeline visualization")


class ProjectPlannerRequest(BaseModel):
    """Model for project planner API requests"""
    project_type: str = Field(..., description="The type of the project")
    industry: str = Field(..., description="The industry of the project")
    project_objectives: str = Field(..., description="The objectives of the project")
    team_members: str = Field(..., description="The team members of the project")
    project_requirements: str = Field(..., description="The requirements of the project")
    start_date: str = Field(..., description="The start date of the project")
    end_date: Optional[str] = Field(None, description="The end date of the project (optional)")


class MyCustomToolInput(BaseModel):
    """Input schema for MyCustomTool."""
    argument: str = Field(..., description="Description of the argument.") 