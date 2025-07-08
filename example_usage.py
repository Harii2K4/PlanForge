#!/usr/bin/env python
"""
Example usage of the global models for frontend integration.
This shows how to use the models to parse and work with project planner data.
"""

import json
from src.project_planner.models import ProjectPlan, TaskEstimation, Milestone, GanttChartEntry

def example_usage():
    """Example of how to use the models with your frontend data"""
    
    # Example: Parse the result from your crew output
    sample_data = {
        "tasks": [
            {
                "task_name": "Create Responsive Design",
                "estimated_time_hours": 80.0,
                "resources_required": ["Bob Smith"],
                "dependencies": [],
                "deliverables": ["Responsive design wireframes"],
                "risks": ["Design feedback delays"],
                "assumptions": ["Timely feedback"],
                "constraints": ["Mobile compatibility required"]
            }
        ],
        "milestones": [
            {
                "milestone_name": "Design Complete",
                "task_name": "Create Responsive Design",
                "start_date": "2025-01-15",
                "end_date": "2025-01-30"
            }
        ],
        "gantt_chart": [
            {
                "task_name": "Create Responsive Design",
                "start_week": 1,
                "duration_weeks": 2,
                "dependencies": []
            }
        ]
    }
    
    # Parse into Pydantic models
    project_plan = ProjectPlan(**sample_data)
    
    print("📋 Project Plan Created Successfully!")
    print(f"Tasks: {len(project_plan.tasks)}")
    print(f"Milestones: {len(project_plan.milestones)}")
    print(f"Gantt Chart Entries: {len(project_plan.gantt_chart)}")
    
    # Convert to JSON for frontend
    json_data = project_plan.model_dump()
    
    print("\n📤 JSON Data for Frontend:")
    print(json.dumps(json_data, indent=2))
    
    # Example: Extract specific data for frontend components
    print("\n🎯 Extracting Data for Frontend Components:")
    
    # Tasks for task list component
    tasks_for_frontend = [
        {
            "name": task.task_name,
            "hours": task.estimated_time_hours,
            "resources": task.resources_required,
            "dependencies": task.dependencies
        }
        for task in project_plan.tasks
    ]
    
    print("Tasks for frontend:", tasks_for_frontend)
    
    # Gantt chart data for timeline component
    gantt_for_frontend = [
        {
            "task": entry.task_name,
            "start": entry.start_week,
            "duration": entry.duration_weeks,
            "deps": entry.dependencies
        }
        for entry in project_plan.gantt_chart
    ]
    
    print("Gantt data for frontend:", gantt_for_frontend)
    
    return project_plan

if __name__ == "__main__":
    print("🚀 Project Planner Models Example")
    print("=" * 50)
    
    try:
        project_plan = example_usage()
        print("\n✅ Example completed successfully!")
        print(f"Project plan contains {len(project_plan.tasks)} tasks")
        
    except Exception as e:
        print(f"❌ Error: {e}") 