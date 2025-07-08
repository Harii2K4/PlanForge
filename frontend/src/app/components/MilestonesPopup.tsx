'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Milestone {
  milestone_name: string;
  task_name: string;
  start_date: string;
  end_date: string;
}

interface MilestonesPopupProps {
  milestones: Milestone[];
  milestoneStatuses: Record<string, string>;
  onUpdateStatus: (milestoneName: string, status: string) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    VANTA: any;
  }
}

export default function MilestonesPopup({ milestones, milestoneStatuses, onUpdateStatus, onClose }: MilestonesPopupProps) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed' | 'missed'>('all');

  useEffect(() => {
    // Load Vanta.js WAVES effect
    const loadVanta = async () => {
      if (!vantaRef.current) return;

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.waves.min.js';
      script.async = true;
      
      script.onload = () => {
        if (window.VANTA && vantaRef.current) {
          const effect = window.VANTA.WAVES({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x0b1929,
            shininess: 30.00,
            waveHeight: 15.00,
            waveSpeed: 0.75,
            zoom: 0.85
          });
          setVantaEffect(effect);
        }
      };

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    };

    loadVanta();

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  // Sort milestones by date
  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  // Filter milestones based on status
  const filteredMilestones = sortedMilestones.filter(milestone => {
    const userStatus = milestoneStatuses[milestone.milestone_name];
    
    if (filterStatus === 'upcoming') {
      return !userStatus || (userStatus !== 'completed' && userStatus !== 'missed');
    } else if (filterStatus === 'completed') {
      return userStatus === 'completed';
    } else if (filterStatus === 'missed') {
      return userStatus === 'missed';
    }
    return true; // 'all'
  });

  // Calculate milestone status
  const getMilestoneStatus = (milestone: Milestone) => {
    const userStatus = milestoneStatuses[milestone.milestone_name];
    
    if (userStatus) {
      switch (userStatus) {
        case 'completed':
          return { status: 'completed', color: '#10b981', label: 'Completed' };
        case 'missed':
          return { status: 'missed', color: '#ef4444', label: 'Missed' };
        case 'on-track':
          return { status: 'on-track', color: '#0b79ee', label: 'On Track' };
        default:
          break;
      }
    }
    
    // Auto-detect status if no user feedback
    const today = new Date();
    const startDate = new Date(milestone.start_date);
    const endDate = new Date(milestone.end_date);
    
    if (today > endDate) return { status: 'overdue', color: '#f59e0b', label: 'Overdue' };
    if (today < startDate) return { status: 'upcoming', color: '#0b79ee', label: 'Upcoming' };
    if (today >= startDate && today <= endDate) return { status: 'in-progress', color: '#f59e0b', label: 'In Progress' };
    
    return { status: 'pending', color: '#9caaba', label: 'Pending' };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-[#111418] rounded-lg w-[90vw] h-[85vh] max-w-6xl flex flex-col overflow-hidden animate-slideUp">
        {/* Vanta Background */}
        <div ref={vantaRef} className="absolute inset-0 opacity-20" />
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#283039]">
            <div>
              <h2 className="text-white text-2xl font-bold">All Milestones</h2>
              <p className="text-[#9caaba] text-sm mt-1">
                Total: {milestones.length} milestones
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Filter Buttons */}
              <div className="flex gap-2">
                {(['all', 'upcoming', 'completed', 'missed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors capitalize ${
                      filterStatus === status
                        ? 'bg-[#0b79ee] text-white'
                        : 'bg-[#283039] text-[#9caaba] hover:bg-[#3b4754]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              
              <button
                onClick={onClose}
                className="text-[#9caaba] hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Milestones Grid */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMilestones.map((milestone, index) => {
                const { status, color, label } = getMilestoneStatus(milestone);
                
                return (
                  <div
                    key={index}
                    className="bg-[#1b2127] border border-[#3b4754] rounded-lg p-5 hover:border-[#0b79ee] transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-fadeInScale"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedMilestone(milestone)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-semibold text-lg flex-1 pr-2">
                        {milestone.milestone_name}
                      </h3>
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: color + '20',
                          color: color,
                          border: `1px solid ${color}40`
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-[#9caaba]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>{milestone.task_name}</span>
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
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="bg-[#283039] rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500"
                          style={{ 
                            width: status === 'completed' ? '100%' : status === 'in-progress' ? '50%' : status === 'missed' ? '0%' : '0%',
                            backgroundColor: color
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Feedback Buttons */}
                    <div className="flex gap-2 mt-3">
                      {status !== 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(milestone.milestone_name, 'completed');
                          }}
                          className="flex-1 px-2 py-1 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Complete
                        </button>
                      )}
                      
                      {status !== 'missed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(milestone.milestone_name, 'missed');
                          }}
                          className="flex-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Missed
                        </button>
                      )}
                      
                      {(status === 'overdue' || status === 'missed') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(milestone.milestone_name, 'on-track');
                          }}
                          className="flex-1 px-2 py-1 bg-[#0b79ee]/20 hover:bg-[#0b79ee]/30 text-[#0b79ee] rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          On Track
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Milestone Detail */}
          {selectedMilestone && (
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 animate-fadeIn"
              onClick={() => setSelectedMilestone(null)}
            >
              <div 
                className="bg-[#1b2127] rounded-lg p-6 max-w-md w-full animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-white text-xl font-bold mb-4">{selectedMilestone.milestone_name}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-[#9caaba]">Associated Task:</span>
                    <p className="text-white font-medium">{selectedMilestone.task_name}</p>
                  </div>
                  <div>
                    <span className="text-[#9caaba]">Duration:</span>
                    <p className="text-white font-medium">
                      {new Date(selectedMilestone.start_date).toLocaleDateString('en-US', { 
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric' 
                      })} - {new Date(selectedMilestone.end_date).toLocaleDateString('en-US', { 
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#9caaba]">Status:</span>
                    <p className="text-white font-medium">{getMilestoneStatus(selectedMilestone).label}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="mt-6 w-full bg-[#0b79ee] text-white py-2 rounded-lg hover:bg-[#0c5aa6] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInScale {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .animate-fadeInScale {
          animation: fadeInScale 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
} 