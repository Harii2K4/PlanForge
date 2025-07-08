from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List
from tools import TrelloBoardDataFetcherTool, TrelloCardDataFetcherTool, TrelloUserDataFetcherTool

@CrewBase
class ProjectProgres():
    """ProjectProgres crew"""

    agents: List[BaseAgent]
    tasks: List[Task]
    @agent
    def data_collection_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['data_collection_agent'], # type: ignore[index]
            verbose=True,
            tools=[TrelloBoardDataFetcherTool(),TrelloCardDataFetcherTool(),TrelloUserDataFetcherTool()],
            allow_delegation=False
        )

    @agent
    def analysis_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['analysis_agent'], # type: ignore[index]
            verbose=True,
            allow_delegation=False
        )
    @task
    def data_collection_task(self) -> Task:
        return Task(
            config=self.tasks_config['data_collection_task'], # type: ignore[index]
        
        )
    @task
    def data_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['data_analysis_task'], # type: ignore[index]
        )

    @task
    def report_generation_task(self) -> Task:
        return Task(
            config=self.tasks_config['report_generation_task'], # type: ignore[index]
            output_file='report.md'
        )

    @crew
    def crew(self) -> Crew:
        """Creates the ProjectProgres crew"""


        return Crew(
            agents=self.agents, # Automatically created by the @agent decorator
            tasks=self.tasks, # Automatically created by the @task decorator
            process=Process.sequential,
            verbose=True,
            
        )
