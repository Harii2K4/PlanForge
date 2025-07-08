'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface TimelineItem {
  task_name: string;
  start_week: number;
  duration_weeks: number;
  dependencies: string[];
}

interface Timeline3DProps {
  ganttData: TimelineItem[];
  onClose: () => void;
}

// Declare Vanta types
declare global {
  interface Window {
    VANTA: any;
  }
}

export default function Timeline3D({ ganttData, onClose }: Timeline3DProps) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<TimelineItem | null>(null);
  const [viewMode, setViewMode] = useState<'3D' | 'Timeline'>('3D');

  useEffect(() => {
    // Load Vanta.js NET effect from CDN
    const loadVanta = async () => {
      if (!vantaRef.current) return;

      // Load Vanta NET script
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.net.min.js';
      script.async = true;
      
      script.onload = () => {
        if (window.VANTA && vantaRef.current) {
          const effect = window.VANTA.NET({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x0b79ee,
            backgroundColor: 0x111418,
            points: 10.00,
            maxDistance: 20.00,
            spacing: 15.00,
            showDots: true
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

  // Calculate timeline positions
  const calculateTimelinePositions = () => {
    if (!ganttData || ganttData.length === 0) return [];

    const maxWeek = Math.max(...ganttData.map(item => item.start_week + item.duration_weeks));
    
    return ganttData.map((item, index) => {
      const startPercent = (item.start_week / maxWeek) * 100;
      const widthPercent = (item.duration_weeks / maxWeek) * 100;
      const yPosition = index * 60 + 20;
      
      return {
        ...item,
        startPercent,
        widthPercent,
        yPosition,
        color: `hsl(${(index * 360) / ganttData.length}, 70%, 50%)`
      };
    });
  };

  const timelinePositions = calculateTimelinePositions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#111418] rounded-lg w-[95vw] h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#283039]">
          <div className="flex items-center gap-4">
            <h2 className="text-white text-xl font-bold">3D Timeline Visualization</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('3D')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === '3D'
                    ? 'bg-[#0b79ee] text-white'
                    : 'bg-[#283039] text-[#9caaba] hover:bg-[#3b4754]'
                }`}
              >
                3D View
              </button>
              <button
                onClick={() => setViewMode('Timeline')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'Timeline'
                    ? 'bg-[#0b79ee] text-white'
                    : 'bg-[#283039] text-[#9caaba] hover:bg-[#3b4754]'
                }`}
              >
                Timeline
              </button>
            </div>
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

        {/* Content */}
        <div className="flex-1 relative overflow-hidden">
          {/* 3D Background */}
          <div 
            ref={vantaRef} 
            className={`absolute inset-0 ${viewMode === '3D' ? 'opacity-100' : 'opacity-30'} transition-opacity duration-500`}
          />

          {/* Timeline Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-full p-8 overflow-auto pointer-events-auto">
              {viewMode === '3D' ? (
                /* 3D View - Floating Task Cards */
                <div className="relative h-full">
                  {timelinePositions.map((item, index) => (
                    <div
                      key={index}
                      className="absolute transform -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-105"
                      style={{
                        left: `${item.startPercent}%`,
                        top: `${(index + 1) * (100 / (timelinePositions.length + 1))}%`,
                        width: `${Math.max(item.widthPercent, 15)}%`
                      }}
                      onClick={() => setSelectedTask(item)}
                    >
                      <div 
                        className="bg-opacity-80 backdrop-blur-sm rounded-lg p-4 border-2"
                        style={{
                          backgroundColor: item.color + '33',
                          borderColor: item.color
                        }}
                      >
                        <h3 className="text-white font-semibold text-sm mb-1">{item.task_name}</h3>
                        <p className="text-xs text-[#9caaba]">
                          Week {item.start_week} - {item.start_week + item.duration_weeks}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-full bg-[#283039] rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.random() * 100}%`,
                                backgroundColor: item.color
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Timeline View - Traditional Gantt Style */
                <div className="bg-[#1b2127] rounded-lg p-6 min-h-full">
                  <div className="mb-6">
                    <h3 className="text-white text-lg font-semibold mb-2">Project Timeline</h3>
                    <p className="text-[#9caaba] text-sm">Interactive timeline showing task progression and dependencies</p>
                  </div>

                  {/* Timeline Grid */}
                  <div className="relative" style={{ minHeight: `${timelinePositions.length * 70 + 100}px` }}>
                    {/* Week markers */}
                    <div className="absolute top-0 left-0 right-0 h-8 border-b border-[#283039] flex items-center">
                      {Array.from({ length: Math.ceil(Math.max(...ganttData.map(item => item.start_week + item.duration_weeks))) }, (_, i) => (
                        <div
                          key={i}
                          className="absolute text-xs text-[#9caaba]"
                          style={{ left: `${(i / Math.max(...ganttData.map(item => item.start_week + item.duration_weeks))) * 100}%` }}
                        >
                          W{i + 1}
                        </div>
                      ))}
                    </div>

                    {/* Task Bars */}
                    {timelinePositions.map((item, index) => (
                      <div
                        key={index}
                        className="absolute cursor-pointer group"
                        style={{
                          left: `${item.startPercent}%`,
                          top: `${item.yPosition + 40}px`,
                          width: `${item.widthPercent}%`,
                          height: '40px'
                        }}
                        onClick={() => setSelectedTask(item)}
                      >
                        <div 
                          className="h-full rounded-md shadow-lg transform group-hover:scale-y-110 transition-all duration-200 flex items-center px-3"
                          style={{
                            backgroundColor: item.color,
                            boxShadow: `0 4px 12px ${item.color}44`
                          }}
                        >
                          <span className="text-white text-sm font-medium truncate">{item.task_name}</span>
                        </div>
                        
                        {/* Dependencies lines */}
                        {item.dependencies.map((dep, depIndex) => {
                          const depTask = timelinePositions.find(t => t.task_name === dep);
                          if (!depTask) return null;
                          
                          return (
                            <svg
                              key={depIndex}
                              className="absolute pointer-events-none"
                              style={{
                                left: '-100%',
                                top: '20px',
                                width: '200%',
                                height: `${Math.abs(depTask.yPosition - item.yPosition)}px`
                              }}
                            >
                              <path
                                d={`M ${item.startPercent}% 0 Q ${(item.startPercent + depTask.startPercent) / 2}% ${Math.abs(depTask.yPosition - item.yPosition) / 2} ${depTask.startPercent + depTask.widthPercent}% ${Math.abs(depTask.yPosition - item.yPosition)}`}
                                fill="none"
                                stroke="#6b7280"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                opacity="0.5"
                              />
                            </svg>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Task Details Modal */}
          {selectedTask && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto"
                 onClick={() => setSelectedTask(null)}>
              <div className="bg-[#1b2127] rounded-lg p-6 max-w-md transform scale-100 transition-transform"
                   onClick={(e) => e.stopPropagation()}>
                <h3 className="text-white text-lg font-bold mb-4">{selectedTask.task_name}</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-[#9caaba]">
                    <span className="text-white font-medium">Start:</span> Week {selectedTask.start_week}
                  </p>
                  <p className="text-[#9caaba]">
                    <span className="text-white font-medium">Duration:</span> {selectedTask.duration_weeks} weeks
                  </p>
                  <p className="text-[#9caaba]">
                    <span className="text-white font-medium">End:</span> Week {selectedTask.start_week + selectedTask.duration_weeks}
                  </p>
                  {selectedTask.dependencies.length > 0 && (
                    <p className="text-[#9caaba]">
                      <span className="text-white font-medium">Dependencies:</span> {selectedTask.dependencies.join(', ')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="mt-4 w-full bg-[#0b79ee] text-white py-2 rounded-lg hover:bg-[#0c5aa6] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#283039] p-4 bg-[#1b2127]">
          <div className="flex items-center justify-between">
            <div className="text-white text-sm">
              <span className="font-medium">3D Timeline:</span>
              <span className="text-[#9caaba] ml-2">
                {viewMode === '3D' 
                  ? 'Click on floating task cards to view details. Drag to rotate the 3D space.'
                  : 'Traditional timeline view with task bars and dependencies. Click tasks for details.'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-[#9caaba] text-sm">
              <span>Total Tasks: {ganttData.length}</span>
              <span className="mx-2">•</span>
              <span>Project Duration: {Math.max(...ganttData.map(item => item.start_week + item.duration_weeks))} weeks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 