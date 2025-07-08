# Project Planner Setup Guide

This guide explains how to set up and run both the FastAPI backend and Next.js frontend for the Project Planner application.

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

## Backend Setup

1. **Install Python Dependencies**

   ```bash
   cd project_planner
   pip install -e .
   ```

2. **Run the FastAPI Backend**

   ```bash
   python run_backend.py
   ```

   The backend will be available at: `http://localhost:8000`

   - API docs: `http://localhost:8000/docs`
   - Health check: `http://localhost:8000/`

## Frontend Setup

1. **Navigate to Frontend Directory**

   ```bash
   cd frontend
   ```

2. **Install Node.js Dependencies**

   ```bash
   npm install
   ```

3. **Run the Next.js Development Server**

   ```bash
   npm run dev
   ```

   The frontend will be available at: `http://localhost:3000`

## Usage

1. **Start Both Servers**: Make sure both the FastAPI backend (port 8000) and Next.js frontend (port 3000) are running.

2. **Access the Application**: Open `http://localhost:3000` in your browser.

3. **Create a Project Plan**:
   - Fill out the project form with details like project type, industry, objectives, etc.
   - Click "Generate Plan" to send the data to the CrewAI backend
   - Wait for the AI to generate a comprehensive project plan
   - View the results on the dashboard with tasks, milestones, and timeline

## API Endpoints

- `GET /` - Health check
- `POST /plan` - Generate project plan (accepts ProjectPlannerRequest, returns ProjectPlan)

## Environment Variables

No environment variables are required for basic setup. The frontend is configured to connect to the backend at `http://localhost:8000`.

## Troubleshooting

- **CORS Issues**: The FastAPI backend includes CORS middleware to allow requests from the frontend
- **Port Conflicts**: Make sure ports 3000 and 8000 are available
- **Missing Dependencies**: Run `pip install -e .` in the backend and `npm install` in the frontend
- **Import Errors**: Ensure you're running the backend from the correct directory with the proper Python path

## Development

- Backend auto-reloads on file changes (thanks to uvicorn reload=True)
- Frontend auto-reloads on file changes (Next.js default behavior)
- Both servers can run simultaneously for full-stack development
