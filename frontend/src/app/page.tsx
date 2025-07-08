'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProjectEntryForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    projectType: '',
    industry: '',
    projectObjectives: '',
    teamMembers: '',
    projectRequirements: '',
    startDate: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Prepare data for backend API (transform field names to match backend expectations)
      const backendData = {
        project_type: formData.projectType,
        industry: formData.industry,
        project_objectives: formData.projectObjectives,
        team_members: formData.teamMembers,
        project_requirements: formData.projectRequirements,
        start_date: formData.startDate
      };

      // Send data to FastAPI backend
      const response = await fetch('http://localhost:8000/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const projectPlan = await response.json();
      
      // Store both original form data and the generated plan in localStorage
      localStorage.setItem('projectData', JSON.stringify(formData));
      localStorage.setItem('projectPlan', JSON.stringify(projectPlan));
      
      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error generating project plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate project plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#111418] dark group/design-root overflow-x-hidden"
        style={{
          "--select-button-svg": "url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724px%27 height=%2724px%27 fill=%27rgb(156,170,186)%27 viewBox=%270 0 256 256%27%3e%3cpath d=%27M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z%27%3e%3c/path%3e%3c/svg%3e')",
          fontFamily: 'Inter, "Noto Sans", sans-serif'
        } as React.CSSProperties & { [key: string]: string }}>
        <div className="layout-container flex h-full grow flex-col">
            <header
                className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#283039] px-4 sm:px-6 lg:px-10 py-3">
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
                <div className="hidden md:flex flex-1 justify-end gap-8">
                    <div className="flex items-center gap-9">
                        <a className="text-white text-sm font-medium leading-normal" href="/">Dashboard</a>
                        <a className="text-white text-sm font-medium leading-normal" href="#">Projects</a>
                        <a className="text-white text-sm font-medium leading-normal" href="#">Templates</a>
                        <a className="text-white text-sm font-medium leading-normal" href="#">Resources</a>
                    </div>
                    <button
                        className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#283039] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
                        suppressHydrationWarning>
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
                
                {/* Mobile menu button */}
                <div className="md:hidden">
                    <button className="text-white p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </header>
            
            <div className="px-4 sm:px-8 lg:px-40 flex flex-1 justify-center py-5">
                <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
                    <h2
                        className="text-white tracking-light text-2xl sm:text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
                        Craft Your Project Plan</h2>
                    
                    {/* Error Message */}
                    {error && (
                        <div className="mx-4 mb-4 p-4 bg-red-600/20 border border-red-600/30 rounded-xl">
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full" suppressHydrationWarning>
                        <div className="flex w-full max-w-full flex-wrap items-end gap-4 px-4 py-3">
                            <label className="flex flex-col w-full min-w-0 flex-1">
                                <select
                                    name="projectType"
                                    value={formData.projectType}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isLoading}
                                    suppressHydrationWarning
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#3b4754] bg-[#1b2127] focus:border-[#3b4754] h-14 bg-[image:--select-button-svg] placeholder:text-[#9caaba] p-[15px] text-base font-normal leading-normal disabled:opacity-50">
                                    <option value="">Select Project Type</option>
                                    <option value="Website">Website</option>
                                    <option value="Mobile App">Mobile App</option>
                                    <option value="Software Development">Software Development</option>
                                    <option value="Marketing Campaign">Marketing Campaign</option>
                                    <option value="Product Launch">Product Launch</option>
                                </select>
                            </label>
                        </div>
                        
                        <div className="flex w-full max-w-full flex-wrap items-end gap-4 px-4 py-3">
                            <label className="flex flex-col w-full min-w-0 flex-1">
                                <select
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isLoading}
                                    suppressHydrationWarning
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#3b4754] bg-[#1b2127] focus:border-[#3b4754] h-14 bg-[image:--select-button-svg] placeholder:text-[#9caaba] p-[15px] text-base font-normal leading-normal disabled:opacity-50">
                                    <option value="">Select Industry</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Education">Education</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                </select>
                            </label>
                        </div>
                        
                        <div className="flex w-full max-w-full flex-wrap items-end gap-4 px-4 py-3">
                            <label className="flex flex-col w-full min-w-0 flex-1">
                                <textarea 
                                    name="projectObjectives"
                                    value={formData.projectObjectives}
                                    onChange={handleInputChange}
                                    placeholder="Project Objectives"
                                    required
                                    disabled={isLoading}
                                    suppressHydrationWarning
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#3b4754] bg-[#1b2127] focus:border-[#3b4754] min-h-36 placeholder:text-[#9caaba] p-[15px] text-base font-normal leading-normal disabled:opacity-50"></textarea>
                            </label>
                        </div>
                        
                        <div className="flex w-full max-w-full flex-wrap items-end gap-4 px-4 py-3">
                            <label className="flex flex-col w-full min-w-0 flex-1">
                                <input 
                                    name="teamMembers"
                                    value={formData.teamMembers}
                                    onChange={handleInputChange}
                                    placeholder="Team Members (comma-separated)"
                                    required
                                    disabled={isLoading}
                                    suppressHydrationWarning
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#3b4754] bg-[#1b2127] focus:border-[#3b4754] h-14 placeholder:text-[#9caaba] p-[15px] text-base font-normal leading-normal disabled:opacity-50" />
                            </label>
                        </div>
                        
                        <div className="flex w-full max-w-full flex-wrap items-end gap-4 px-4 py-3">
                            <label className="flex flex-col w-full min-w-0 flex-1">
                                <textarea 
                                    name="projectRequirements"
                                    value={formData.projectRequirements}
                                    onChange={handleInputChange}
                                    placeholder="Project Requirements"
                                    required
                                    disabled={isLoading}
                                    suppressHydrationWarning
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#3b4754] bg-[#1b2127] focus:border-[#3b4754] min-h-36 placeholder:text-[#9caaba] p-[15px] text-base font-normal leading-normal disabled:opacity-50"></textarea>
                            </label>
                        </div>
                        
                        <div className="flex w-full max-w-full flex-wrap items-end gap-4 px-4 py-3">
                            <label className="flex flex-col w-full min-w-0 flex-1">
                                <input 
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    type="date"
                                    placeholder="Start Date"
                                    required
                                    disabled={isLoading}
                                    suppressHydrationWarning
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#3b4754] bg-[#1b2127] focus:border-[#3b4754] h-14 placeholder:text-[#9caaba] p-[15px] text-base font-normal leading-normal disabled:opacity-50" />
                            </label>
                        </div>
                        
                        <div className="flex px-4 py-3 justify-center">
                            <button
                                type="submit"
                                disabled={isLoading}
                                suppressHydrationWarning
                                className="flex min-w-[84px] w-full sm:w-auto max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 sm:h-10 px-4 bg-[#0b79ee] text-white text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating Plan...
                                    </>
                                ) : (
                                    <span className="truncate">Generate Plan</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
}
