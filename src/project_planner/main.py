#!/usr/bin/env python
import json
import warnings

from datetime import datetime
import pandas as pd
from crew import ProjectPlanner
from dotenv import load_dotenv
load_dotenv()

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")


def run():
    """
    Run the crew.
    """

    project = 'Website'
    industry = 'Technology'
    project_objectives = 'Create a website for a small business'
    team_members = """
    - John Doe (Project Manager)
    - Jane Doe (Software Engineer)
    - Bob Smith (Designer)
    - Alice Johnson (QA Engineer)
    - Tom Brown (QA Engineer)
    """
    project_requirements = """
    - Create a responsive design that works well on desktop and mobile devices
    - Implement a modern, visually appealing user interface with a clean look
    - Develop a user-friendly navigation system with intuitive menu structure
    - Include an "About Us" page highlighting the company's history and values
    - Design a "Services" page showcasing the business's offerings with descriptions
    - Create a "Contact Us" page with a form and integrated map for communication
    - Implement a blog section for sharing industry news and company updates
    - Ensure fast loading times and optimize for search engines (SEO)
    - Integrate social media links and sharing capabilities
    - Include a testimonials section to showcase customer feedback and build trust
"""
    start_date = datetime.now().strftime('%Y-%m-%d')
    inputs = {
        'project_type': project,
        'industry': industry,
        'project_objectives': project_objectives,
        'team_members': team_members,
        'project_requirements': project_requirements,
        'start_date': start_date
    }
    
    try:
        result = ProjectPlanner().crew().kickoff(inputs=inputs) #output is a ProjectPlan object pydantic model
        # Access token usage information
        if result.token_usage:
            total_tokens = result.token_usage.get('total_tokens', 0)
            prompt_tokens = result.token_usage.get('prompt_tokens', 0)
            completion_tokens = result.token_usage.get('completion_tokens', 0)
            requests = result.token_usage.get('requests', 0)    
    
            print(f"Total Tokens: {total_tokens}")
            print(f"Prompt Tokens: {prompt_tokens}")
            print(f"Completion Tokens: {completion_tokens}")
            print(f"API Requests: {requests}")
        if result.pydantic:
            project_plan = result.pydantic
            print("Project Plan:")
            print(project_plan)
            # Save the result to a file
            with open('result.json', 'w') as f:
                json.dump(project_plan.model_dump(), f)
    except Exception as e:
        raise Exception(f"An error occurred while running the crew: {e}")
    
run()




