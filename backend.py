from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from .src.project_planner.models import ProjectPlannerRequest, ProjectPlan
import json
import os
import logging
from .src.project_progres.crew import ProjectProgres
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Project Planner API", description="CrewAI-powered project planning API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/plan", response_model=ProjectPlan, status_code=200)
def run_CrewAI_planner(request: ProjectPlannerRequest) -> ProjectPlan:
    """
    Run the CrewAI project planner with the provided request data.
    
    Args:
        request: ProjectPlannerRequest containing project details
        
    Returns:
        ProjectPlan: Complete project plan with tasks, milestones, and Gantt chart
    """
    try:
        # Log the incoming request
        logger.info(f"Received request: {request}")
        
        from .src.project_planner.crew import ProjectPlanner
        
        # Convert request to crew inputs format
        inputs = {
            'project_type': request.project_type,
            'industry': request.industry,
            'project_objectives': request.project_objectives,
            'team_members': request.team_members,
            'project_requirements': request.project_requirements,
            'start_date': request.start_date
        }
        
        logger.info(f"Converted inputs: {inputs}")
        
        # Run the crew and get the result
        #result = ProjectPlanner().crew().kickoff(inputs=inputs)
        # Get the path to result.json relative to the project root
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
        result_path = os.path.join(project_root,'project_planner','result.json')
        
        logger.info(f"Looking for result file at: {result_path}")
        
        if not os.path.exists(result_path):
            raise HTTPException(status_code=404, detail=f"Result file not found at {result_path}")
        
        with open(result_path, 'r') as f:
            result_data = json.load(f)
        
        result = result_data
        
        # Extract the Pydantic model from the result
        if hasattr(result, 'pydantic') and result.pydantic:
            return result.pydantic
        else:
            # Fallback: try to parse from result directly
            logger.info(f"Returning result directly: {type(result)}")
            return result
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in run_CrewAI_planner: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/progress",status_code=200)
def run_CrewAI_progress() -> None:
    """
    Run the CrewAI project progress tracker with the provided request data.
    """
    try:
        logger.info("Running CrewAI project progress tracker")
        ProjectProgres().crew().kickoff()
    except Exception as e:
        logger.error(f"Error in run_CrewAI_progress: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))





