'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import GanttChart to avoid SSR issues
const GanttChart = dynamic(() => import('../components/GanttChart'), { ssr: false });
const Timeline3D = dynamic(() => import('../components/Timeline3D'), { ssr: false });
const MilestonesPopup = dynamic(() => import('../components/MilestonesPopup'), { ssr: false });

interface Task {
  task_name: string;
  estimated_time_hours: number;
  resources_required: string[];
  dependencies: string[];
  deliverables: string[];
  risks: string[];
  assumptions: string[];
  constraints: string[];
}

interface Milestone {
  milestone_name: string;
  task_name: string;
  start_date: string;
  end_date: string;
  status?: 'completed' | 'missed' | 'on-track' | 'pending';
}

interface GanttChartEntry {
  task_name: string;
  start_week: number;
  duration_weeks: number;
  dependencies: string[];
}

interface ProjectPlan {
  tasks: Task[];
  milestones: Milestone[];
  gantt_chart: GanttChartEntry[];
}

export default function ProjectPlanDashboard() {
  const router = useRouter();
  const [projectData, setProjectData] = useState<any>(null);
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGanttChart, setShowGanttChart] = useState(false);
  const [showTimeline3D, setShowTimeline3D] = useState(false);
  const [showAllMilestones, setShowAllMilestones] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectProgress, setProjectProgress] = useState(0);
  const [milestoneStatuses, setMilestoneStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load data from localStorage
    const storedProjectData = localStorage.getItem('projectData');
    const storedProjectPlan = localStorage.getItem('projectPlan');
    const storedProjectName = localStorage.getItem('projectName');
    const storedMilestoneStatuses = localStorage.getItem('milestoneStatuses');
    
    if (storedProjectData) {
      setProjectData(JSON.parse(storedProjectData));
    }
    
    if (storedProjectPlan) {
      setProjectPlan(JSON.parse(storedProjectPlan));
    } else {
      // If no project plan, redirect to form
      router.push('/');
      return;
    }
    
    if (storedProjectName) {
      setProjectName(storedProjectName);
    } else {
      setProjectName('My Project');
    }
    
    if (storedMilestoneStatuses) {
      setMilestoneStatuses(JSON.parse(storedMilestoneStatuses));
    }
    
    setLoading(false);
  }, [router]);

  const handleProjectNameSave = () => {
    localStorage.setItem('projectName', projectName);
    setIsEditingName(false);
  };

  const calculateEndDate = () => {
    if (!projectData || !projectPlan) return 'N/A';
    
    // Calculate based on gantt chart data
    if (projectPlan.gantt_chart && projectPlan.gantt_chart.length > 0) {
      const maxWeek = Math.max(...projectPlan.gantt_chart.map(item => 
        item.start_week + item.duration_weeks
      ));
      
      const startDate = new Date(projectData.startDate || new Date());
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (maxWeek * 7));
      
      return endDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    return 'N/A';
  };

  // Update milestone status
  const updateMilestoneStatus = (milestoneName: string, status: string) => {
    const newStatuses = { ...milestoneStatuses, [milestoneName]: status };
    setMilestoneStatuses(newStatuses);
    localStorage.setItem('milestoneStatuses', JSON.stringify(newStatuses));
    
    // Update project progress based on milestones
    if (projectPlan) {
      const completedCount = Object.values(newStatuses).filter(s => s === 'completed').length;
      const totalMilestones = projectPlan.milestones.length;
      const newProgress = Math.round((completedCount / totalMilestones) * 100);
      setProjectProgress(newProgress);
    }
  };

  // Get milestone status with feedback
  const getMilestoneStatus = (milestone: Milestone) => {
    const userStatus = milestoneStatuses[milestone.milestone_name];
    if (userStatus) {
      switch (userStatus) {
        case 'completed':
          return { status: 'completed', color: '#10b981', label: 'Completed', bgColor: 'bg-[#10b981]/20', borderColor: 'border-[#10b981]/40' };
        case 'missed':
          return { status: 'missed', color: '#ef4444', label: 'Missed', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/40' };
        case 'on-track':
          return { status: 'on-track', color: '#0b79ee', label: 'On Track', bgColor: 'bg-[#0b79ee]/20', borderColor: 'border-[#0b79ee]/40' };
        default:
          break;
      }
    }
    
    // Auto-detect status if no user feedback
    const today = new Date();
    const startDate = new Date(milestone.start_date);
    const endDate = new Date(milestone.end_date);
    
    if (today > endDate && !userStatus) {
      return { status: 'overdue', color: '#f59e0b', label: 'Overdue', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/40' };
    } else if (today >= startDate && today <= endDate) {
      return { status: 'in-progress', color: '#f59e0b', label: 'In Progress', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/40' };
    } else if (today < startDate) {
      return { status: 'upcoming', color: '#9caaba', label: 'Upcoming', bgColor: 'bg-[#9caaba]/20', borderColor: 'border-[#9caaba]/40' };
    }
    
    return { status: 'pending', color: '#9caaba', label: 'Pending', bgColor: 'bg-[#9caaba]/20', borderColor: 'border-[#9caaba]/40' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111418]">
        <div className="text-white text-lg">Loading project plan...</div>
      </div>
    );
  }

  if (!projectPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111418]">
        <div className="text-center">
          <div className="text-white text-lg mb-4">No project plan found</div>
          <button 
            onClick={() => router.push('/')}
            className="bg-[#0b79ee] text-white px-4 py-2 rounded-lg"
          >
            Create New Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#111418] dark group/design-root overflow-x-hidden"
        style={{
          fontFamily: 'Inter, "Noto Sans", sans-serif'
        }}>
        <div className="layout-container flex h-full grow flex-col">
            <header
                className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#283039] px-10 py-3">
                <div className="flex items-center gap-4 text-white">
                    <div className="size-4">
                        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd"
                                d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                                fill="currentColor"></path>
                        </svg>
                    </div>
                    <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">PlanForge</h2>
                </div>
                <div className="flex items-center gap-4">
                    {/* View Gantt Chart Button */}
                    <button
                        onClick={() => setShowGanttChart(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0b79ee] hover:bg-[#0c5aa6] text-white rounded-lg text-sm font-medium transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        View Gantt Chart
                    </button>

                    {/* View 3D Timeline Button */}
                    <button
                        onClick={() => setShowTimeline3D(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-sm font-medium transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        View 3D Timeline
                    </button>
                    
                    <button
                        className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#283039] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                        <div className="text-white" data-icon="Bell" data-size="20px" data-weight="regular">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor"
                                viewBox="0 0 256 256">
                                <path
                                    d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z">
                                </path>
                            </svg>
                        </div>
                    </button>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                        style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBf0f2jz5bdG8j3FRfOHehE3Sr46lAfX_buuPbdSCon8hT-3ERz7DVy_ew3-SM9j4cIRVCazjgfKtA-R1MIUsWUDaRisnz9sMOlywUi406BF5yXvrmGOgg9vZfYDC48mFYnl9UEdqou8ED3GSs1PkhYTOK-XN9BBurIxVox8RX7MYytyLZMZ50KcXPpGYH4IUbH8za1aGqpHfBiczJV0b9mqA5PTximw3dhEW7yzaJAhJiNDduosr4h-X8xVeN4Wd_i9YEK-Lwyi2Y")'}}></div>
                </div>
            </header>
            <div className="px-40 flex flex-1 justify-center py-5">
                <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                    <h1
                        className="text-white text-[32px] font-bold leading-tight tracking-[-0.015em] px-4 text-center pb-3 pt-5">
                        Project Plan Dashboard
                    </h1>

                    {/* Project Overview Section */}
                    <div className="px-4 py-3">
                        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4">
                            Project Overview
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {/* Project Name Card */}
                            <div className="bg-[#1b2127] border border-[#3b4754] rounded-xl p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[#9caaba] text-sm font-medium">Project Name</h3>
                                    <button
                                        onClick={() => setIsEditingName(!isEditingName)}
                                        className="text-[#9caaba] hover:text-white transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                                {isEditingName ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleProjectNameSave()}
                                            className="bg-[#283039] text-white text-lg font-semibold px-2 py-1 rounded border border-[#3b4754] focus:outline-none focus:border-[#0b79ee] w-full"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleProjectNameSave}
                                            className="text-[#10b981] hover:text-[#059669]"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-white text-lg font-semibold truncate">{projectName}</p>
                                )}
                            </div>

                            {/* Start Date Card */}
                            <div className="bg-[#1b2127] border border-[#3b4754] rounded-xl p-5">
                                <h3 className="text-[#9caaba] text-sm font-medium mb-2">Start Date</h3>
                                <p className="text-white text-lg font-semibold">
                                    {projectData?.startDate 
                                        ? new Date(projectData.startDate).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric' 
                                          })
                                        : 'N/A'}
                                </p>
                            </div>

                            {/* End Date Card */}
                            <div className="bg-[#1b2127] border border-[#3b4754] rounded-xl p-5">
                                <h3 className="text-[#9caaba] text-sm font-medium mb-2">End Date</h3>
                                <p className="text-white text-lg font-semibold">
                                    {calculateEndDate()}
                                </p>
                            </div>

                            {/* Progress Card */}
                            <div className="bg-[#1b2127] border border-[#3b4754] rounded-xl p-5">
                                <h3 className="text-[#9caaba] text-sm font-medium mb-2">Progress</h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="bg-[#283039] rounded-full h-2 overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-[#0b79ee] to-[#10b981] h-full transition-all duration-300"
                                                style={{ width: `${projectProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-white text-lg font-semibold">{projectProgress}%</span>
                                </div>
                                <p className="text-[#9caaba] text-xs mt-2">To be implemented</p>
                            </div>
                        </div>
                    </div>

                    {/* Milestones */}
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                                    Upcoming Milestones
                                </h2>
                                <p className="text-[#9caaba] text-sm mt-1">
                                    Next {Math.min(3, projectPlan.milestones.length)} of {projectPlan.milestones.length} milestones
                                </p>
                            </div>
                            
                            {projectPlan.milestones.length > 3 && (
                                <button
                                    onClick={() => setShowAllMilestones(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#283039] hover:bg-[#3b4754] text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    View All Milestones
                                </button>
                            )}
                        </div>
                        
                        {/* Milestone Cards for Next 3 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {projectPlan.milestones
                                .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                                .filter(milestone => {
                                    const status = getMilestoneStatus(milestone);
                                    return status.status !== 'completed' && status.status !== 'missed';
                                })
                                .slice(0, 3)
                                .map((milestone, index) => {
                                    const statusInfo = getMilestoneStatus(milestone);
                                    
                                    return (
                                        <div 
                                            key={index} 
                                            className="bg-[#1b2127] border border-[#3b4754] rounded-xl p-5 hover:border-[#0b79ee] transition-all duration-300"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="text-white font-semibold text-lg flex-1 pr-2">
                                                    {milestone.milestone_name}
                                                </h3>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.bgColor} ${statusInfo.borderColor} border`}
                                                      style={{ color: statusInfo.color }}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-2 text-sm mb-4">
                                                <div className="flex items-center gap-2 text-[#9caaba]">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    <span className="truncate">{milestone.task_name}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 text-[#9caaba]">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>
                                                        {new Date(milestone.start_date).toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })} - {new Date(milestone.end_date).toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Feedback Buttons */}
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => updateMilestoneStatus(milestone.milestone_name, 'completed')}
                                                    className="flex-1 px-2 py-1 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="text-[11px]">Complete</span>
                                                </button>
                                                
                                                <button
                                                    onClick={() => updateMilestoneStatus(milestone.milestone_name, 'missed')}
                                                    className="flex-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    <span className="text-[11px]">Missed</span>
                                                </button>
                                                
                                                {statusInfo.status === 'overdue' && (
                                                    <button
                                                        onClick={() => updateMilestoneStatus(milestone.milestone_name, 'on-track')}
                                                        className="flex-1 px-2 py-1 bg-[#0b79ee]/20 hover:bg-[#0b79ee]/30 text-[#0b79ee] rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-[11px]">On Track</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                        
                        {/* Fallback if no upcoming milestones */}
                        {projectPlan.milestones.filter(m => new Date(m.end_date) >= new Date()).length === 0 && (
                            <div className="bg-[#1b2127] border border-[#3b4754] rounded-xl p-8 text-center">
                                <svg className="w-12 h-12 text-[#9caaba] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <p className="text-[#9caaba]">No upcoming milestones</p>
                                <button
                                    onClick={() => setShowAllMilestones(true)}
                                    className="mt-4 text-[#0b79ee] hover:text-[#0c5aa6] text-sm font-medium"
                                >
                                    View all milestones →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tasks */}
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                                    Tasks Overview
                                </h2>
                                <p className="text-[#9caaba] text-sm mt-1">
                                    {projectPlan.tasks.length} tasks in total
                                </p>
                            </div>
                            
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-[#283039] hover:bg-[#3b4754] text-[#9caaba] rounded text-sm font-medium transition-colors">
                                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                    </svg>
                                    Sort
                                </button>
                                <button className="px-3 py-1 bg-[#283039] hover:bg-[#3b4754] text-[#9caaba] rounded text-sm font-medium transition-colors">
                                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Filter
                                </button>
                            </div>
                        </div>
                        
                        {/* Tasks Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {projectPlan.tasks.map((task, index) => {
                                const totalHours = task.estimated_time_hours;
                                const hoursPerDay = 8;
                                const estimatedDays = Math.ceil(totalHours / hoursPerDay);
                                const taskColor = `hsl(${(index * 360) / projectPlan.tasks.length}, 70%, 50%)`;
                                
                                return (
                                    <div 
                                        key={index} 
                                        className="bg-[#1b2127] border border-[#3b4754] rounded-xl p-5 hover:border-[#0b79ee] transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg"
                                        style={{
                                            animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                                        }}
                                    >
                                        {/* Task Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start gap-3">
                                                <div 
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                                    style={{ backgroundColor: taskColor + '30', color: taskColor }}
                                                >
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-semibold text-lg">{task.task_name}</h3>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-[#9caaba] text-sm flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {totalHours}h ({estimatedDays} days)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <span 
                                                    className="px-2 py-1 rounded text-xs font-medium"
                                                    style={{ 
                                                        backgroundColor: taskColor + '20',
                                                        color: taskColor,
                                                        border: `1px solid ${taskColor}40`
                                                    }}
                                                >
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Resources */}
                                        <div className="mb-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg className="w-4 h-4 text-[#9caaba]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span className="text-[#9caaba] text-sm font-medium">Resources:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {task.resources_required.map((resource, rIndex) => (
                                                    <span 
                                                        key={rIndex}
                                                        className="px-2 py-1 bg-[#283039] text-[#9caaba] rounded-full text-xs"
                                                    >
                                                        {resource}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Dependencies */}
                                        {task.dependencies.length > 0 && (
                                            <div className="mb-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <svg className="w-4 h-4 text-[#9caaba]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                    </svg>
                                                    <span className="text-[#9caaba] text-sm font-medium">Dependencies:</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {task.dependencies.map((dep, dIndex) => (
                                                        <span 
                                                            key={dIndex}
                                                            className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs flex items-center gap-1"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                            {dep}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Deliverables */}
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg className="w-4 h-4 text-[#9caaba]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-[#9caaba] text-sm font-medium">Deliverables:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {task.deliverables.map((deliverable, delIndex) => (
                                                    <span 
                                                        key={delIndex}
                                                        className="px-2 py-1 bg-[#0b79ee]/20 text-[#0b79ee] rounded text-xs"
                                                    >
                                                        {deliverable}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Task Progress Bar */}
                                        <div className="mt-4 pt-4 border-t border-[#283039]">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[#9caaba] text-xs">Task Progress</span>
                                                <span className="text-[#9caaba] text-xs">0%</span>
                                            </div>
                                            <div className="bg-[#283039] rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className="h-full transition-all duration-500 rounded-full"
                                                    style={{ 
                                                        width: '0%',
                                                        backgroundColor: taskColor
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-2 mt-4">
                                            <button className="flex-1 px-3 py-1.5 bg-[#283039] hover:bg-[#3b4754] text-[#9caaba] rounded text-xs font-medium transition-colors">
                                                View Details
                                            </button>
                                            <button className="px-3 py-1.5 bg-[#283039] hover:bg-[#3b4754] text-[#9caaba] rounded text-xs font-medium transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Add animation styles */}
                        <style jsx>{`
                            @keyframes fadeInUp {
                                from {
                                    opacity: 0;
                                    transform: translateY(20px);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateY(0);
                                }
                            }
                        `}</style>
                    </div>
                </div>
            </div>
        </div>

        {/* Gantt Chart Modal */}
        {showGanttChart && projectPlan && (
            <GanttChart
                tasks={projectPlan.tasks}
                milestones={projectPlan.milestones}
                ganttData={projectPlan.gantt_chart}
                onClose={() => setShowGanttChart(false)}
            />
        )}

        {/* 3D Timeline Modal */}
        {showTimeline3D && projectPlan && projectPlan.gantt_chart && (
            <Timeline3D
                ganttData={projectPlan.gantt_chart}
                onClose={() => setShowTimeline3D(false)}
            />
        )}

        {/* All Milestones Popup */}
        {showAllMilestones && projectPlan && (
            <MilestonesPopup
                milestones={projectPlan.milestones}
                milestoneStatuses={milestoneStatuses}
                onUpdateStatus={updateMilestoneStatus}
                onClose={() => setShowAllMilestones(false)}
            />
        )}
    </div>
  );
} 