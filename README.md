# Project Planner - Full Stack AI-Powered Project Management

Welcome to the Project Planner, a comprehensive full-stack application powered by [crewAI](https://crewai.com). This project combines the power of multi-agent AI systems with modern web technologies to create intelligent project planning and management solutions.

## 🏗️ Architecture Overview

This application consists of three main components:

1. **AI Crews (crewAI)** - Multi-agent AI system for intelligent project planning and progress tracking
2. **FastAPI Backend** - RESTful API server that interfaces with the AI crews
3. **Next.js Frontend** - Modern React-based UI with interactive dashboards, Gantt charts, and 3D visualizations

## ✨ Features

### AI-Powered Planning

- **Project Planner Crew**: Analyzes project requirements and generates comprehensive project plans
- **Project Progress Crew**: Tracks and analyzes project progress with intelligent insights
- **Multi-agent collaboration**: Specialized AI agents work together for optimal results

### Modern Web Interface

- **Interactive Dashboard**: Clean, intuitive interface for project management
- **Gantt Chart Visualization**: Dynamic project timeline with Frappe Gantt integration
- **3D Timeline**: Immersive Three.js-powered timeline visualization
- **Real-time Updates**: Live project data and progress tracking
- **Responsive Design**: Optimized for desktop and mobile devices

### Robust Backend

- **RESTful API**: FastAPI-powered backend with automatic OpenAPI documentation
- **CORS Support**: Seamless frontend-backend communication
- **Error Handling**: Comprehensive error management and logging
- **Scalable Architecture**: Modular design for easy extension

## 🛠️ Technology Stack

### Backend

- **Python 3.10+**: Core programming language
- **crewAI**: Multi-agent AI framework
- **FastAPI**: Modern, fast web framework for building APIs
- **Pydantic**: Data validation and serialization
- **Uvicorn**: Lightning-fast ASGI server

### Frontend

- **Next.js 15**: React framework with App Router
- **React 19**: Modern React with latest features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Frappe Gantt**: Interactive Gantt chart component
- **Three.js**: 3D graphics and animations
- **Vanta.js**: Animated backgrounds

## 📦 Installation

### Prerequisites

- Python >=3.10 <3.13
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Install UV (if not already installed)**:

   ```bash
   pip install uv
   ```

2. **Navigate to project directory and install dependencies**:

   ```bash
   cd project_planner
   crewai install
   ```

3. **Add your OpenAI API key**:
   Create a `.env` file and add:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

### Frontend Setup

1. **Navigate to frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## 🚀 Running the Application

### Start the Backend Server

```bash
# From the project_planner directory
python run_backend.py
```

The backend will be available at:

- API Server: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Interactive API: `http://localhost:8000/redoc`

### Start the Frontend Server

```bash
# From the frontend directory
cd frontend
npm run dev
```

The frontend will be available at: `http://localhost:3000`

### Running AI Crews Only

To run just the crewAI components without the web interface:

```bash
# From the project_planner directory
crewai run
```

This will execute the project planner crew and generate a `report.md` file.

## 🔧 Configuration

### Customizing AI Agents

- **Agents**: Modify `src/project_planner/config/agents.yaml` to define your AI agents
- **Tasks**: Modify `src/project_planner/config/tasks.yaml` to define agent tasks
- **Crew Logic**: Customize `src/project_planner/crew.py` for specific logic, tools, and arguments
- **Tools**: Add custom tools in `src/project_planner/tools/`

### API Configuration

- **Models**: Update `src/project_planner/models.py` for data models
- **Endpoints**: Extend `backend.py` for additional API endpoints
- **CORS**: Modify CORS settings in `backend.py` for different frontend URLs

### Frontend Customization

- **Components**: Enhance UI components in `src/app/components/`
- **Styling**: Customize styles in `src/app/globals.css`
- **Pages**: Add new pages in the `src/app/` directory

## 📡 API Endpoints

### Project Planning

- **POST `/plan`**: Generate comprehensive project plan
  - Input: `ProjectPlannerRequest` (project details)
  - Output: `ProjectPlan` (tasks, milestones, Gantt chart data)

### Progress Tracking

- **POST `/progress`**: Run project progress analysis
  - Input: Project data
  - Output: Progress insights and recommendations

### Health Check

- **GET `/`**: API health check

## 🎯 Usage Workflow

1. **Start both servers** (backend on :8000, frontend on :3000)
2. **Access the web application** at `http://localhost:3000`
3. **Fill out the project form** with:
   - Project type and industry
   - Objectives and requirements
   - Team member details
   - Start date preferences
4. **Generate AI-powered project plan** by clicking "Generate Plan"
5. **View comprehensive results** including:
   - Detailed task breakdown
   - Project milestones
   - Interactive Gantt chart
   - 3D timeline visualization
   - Progress tracking insights

## 📁 Project Structure

```
project_planner/
├── backend.py              # FastAPI application
├── run_backend.py         # Backend server runner
├── frontend/              # Next.js frontend application
│   ├── src/app/          # App Router pages and components
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── src/project_planner/   # crewAI project planner
│   ├── config/           # Agent and task configurations
│   ├── crew.py          # Main crew orchestration
│   ├── models.py        # Data models
│   └── tools/           # Custom AI tools
├── src/project_progres/   # crewAI progress tracking
├── html_designs/         # Static HTML prototypes
└── knowledge/           # AI knowledge base
```

## 🤝 Understanding Your Crews

### Project Planner Crew

- **Purpose**: Generate comprehensive project plans from user requirements
- **Agents**: Specialized AI agents for different aspects of project planning
- **Output**: Structured project plans with tasks, timelines, and resource allocation

### Project Progress Crew

- **Purpose**: Analyze and track project progress with intelligent insights
- **Agents**: Progress analysts, risk assessors, and recommendation engines
- **Output**: Progress reports, risk assessments, and optimization suggestions

## 🔍 Development

### Backend Development

- **Auto-reload**: Server automatically reloads on file changes
- **Logging**: Comprehensive logging for debugging
- **Testing**: Run tests with `pytest tests/`

### Frontend Development

- **Hot reload**: Next.js automatically reloads on changes
- **TypeScript**: Full type safety and IntelliSense
- **Component library**: Reusable components for rapid development

## 📚 Documentation & Support

- **API Documentation**: Visit `http://localhost:8000/docs` when running the backend
- **crewAI Documentation**: [docs.crewai.com](https://docs.crewai.com)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **FastAPI Documentation**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com)

## 🆘 Support & Community

For support, questions, or feedback:

- 📖 [crewAI Documentation](https://docs.crewai.com)
- 🐙 [GitHub Repository](https://github.com/joaomdmoura/crewai)
- 💬 [Join our Discord](https://discord.com/invite/X4JWnZnxPb)
- 💡 [Chat with our docs](https://chatg.pt/DWjSBZn)

---

**Ready to revolutionize project management with AI?** Start by running both the backend and frontend servers, then experience the power of intelligent project planning! 🚀
