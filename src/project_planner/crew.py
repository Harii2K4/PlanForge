
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List
from .models import ProjectPlan

@CrewBase
class ProjectPlanner():
    """ProjectPlanner crew"""

    agents: List[BaseAgent]
    tasks: List[Task]

    
    @agent
    def project_planner_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['project_planner_agent'], # type: ignore[index]
            verbose=True,
            allow_delegation=False
        )

    @agent
    def estimation_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['estimation_agent'], # type: ignore[index]
            verbose=True,
            allow_delegation=False
        )
    @agent
    def resource_allocation_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['resource_allocation_agent'], # type: ignore[index]
            verbose=True,
            allow_delegation=False
        )  

    # Tasks
    @task
    def task_breakdown(self) -> Task:
        return Task(
            config=self.tasks_config['task_breakdown'], # type: ignore[index]
        )

    @task
    def time_resource_estimation(self) -> Task:
        return Task(
            config=self.tasks_config['time_resource_estimation'], # type: ignore[index]
           
        )
    @task
    def resource_allocation(self) -> Task:
        return Task(
            config=self.tasks_config['resource_allocation'],
            output_pydantic=ProjectPlan 
            
        )


    @crew
    def crew(self) -> Crew:
        """Creates the ProjectPlanner crew"""
        return Crew(
            agents=self.agents, # Automatically created by the @agent decorator
            tasks=self.tasks, # Automatically created by the @task decorator
            process=Process.sequential,
            verbose=True,
                
        )
