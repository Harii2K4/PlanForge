#!/usr/bin/env python
import warnings
from crew import ProjectProgres

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")
from dotenv import load_dotenv
load_dotenv()

def run():
    """
    Run the crew.
    """
    try:
        ProjectProgres().crew().kickoff()
    except Exception as e:
        raise Exception(f"An error occurred while running the crew: {e}")


run()