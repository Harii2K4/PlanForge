'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Script from 'next/script';

interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies?: string[];
}

interface GanttChartProps {
  tasks: any[];
  milestones: any[];
  ganttData: any[];
  onClose: () => void;
}

export default function GanttChart({ tasks, milestones, ganttData, onClose }: GanttChartProps) {
  const [viewMode, setViewMode] = useState('Week');
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const ganttInstanceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert our data to Frappe Gantt format
  useEffect(() => {
    if (!ganttData || ganttData.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const convertedTasks: GanttTask[] = ganttData.map((item, index) => {
        if (!item.task_name || !item.start_week || !item.duration_weeks) {
          throw new Error(`Invalid task data at index ${index}: missing required fields`);
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() + (item.start_week - 1) * 7);
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + item.duration_weeks * 7);

        // Create task in Frappe Gantt format
        const task: GanttTask = {
          id: String(index + 1), // Frappe Gantt expects string IDs
          name: String(item.task_name).trim() || `Task ${index + 1}`,
          start: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
          end: endDate.toISOString().split('T')[0],
          progress: Math.floor(Math.random() * 100),
        };

        // Handle dependencies
        if (item.dependencies && Array.isArray(item.dependencies) && item.dependencies.length > 0) {
          task.dependencies = item.dependencies.map((dep: string) => {
            const depIndex = ganttData.findIndex(t => t.task_name === dep);
            return depIndex >= 0 ? String(depIndex + 1) : '';
          }).filter(Boolean);
        }

        return task;
      });

      setGanttTasks(convertedTasks);
      setError(null);
    } catch (err) {
      console.error('Error converting gantt data:', err);
      setError(err instanceof Error ? err.message : 'Failed to process gantt data');
    }
  }, [ganttData]);

  // Initialize Gantt chart when scripts are loaded and tasks are ready
  useEffect(() => {
    if (!scriptsLoaded || !containerRef.current || ganttTasks.length === 0) {
      return;
    }

    // Clean up any existing instance
    if (ganttInstanceRef.current) {
      try {
        containerRef.current.innerHTML = '';
      } catch (e) {
        console.warn('Error cleaning up Gantt:', e);
      }
    }

    // Initialize Frappe Gantt following the documentation exactly
    try {
      // @ts-ignore - Gantt is loaded from CDN
      if (typeof Gantt === 'undefined') {
        throw new Error('Gantt library not loaded');
      }

      // Initialize exactly as shown in documentation: new Gantt("#gantt", tasks)
      // @ts-ignore
      ganttInstanceRef.current = new Gantt("#gantt", ganttTasks, {
        view_mode: viewMode,
        date_format: 'YYYY-MM-DD',
        bar_height: 30,
        bar_corner_radius: 3,
        arrow_curve: 5,
        padding: 18,
        column_width: 30,
        step: 24,
        view_modes: ['Day', 'Week', 'Month'],
        popup_trigger: 'click',
        custom_popup_html: function(task: any) {
          return `
            <div class="details-container">
              <h5>${task.name}</h5>
              <p>Start: ${task._start.format('MMM D')}</p>
              <p>End: ${task._end.format('MMM D')}</p>
              <p>Progress: ${task.progress}%</p>
            </div>
          `;
        },
        on_click: function (task: any) {
          console.log('Task clicked:', task);
        },
        on_date_change: function(task: any, start: any, end: any) {
          console.log('Date changed:', task.name, start, end);
        },
        on_progress_change: function(task: any, progress: any) {
          console.log('Progress changed:', task.name, progress);
          // Update local state
          setGanttTasks(prev => prev.map(t => 
            t.id === task.id ? { ...t, progress } : t
          ));
        },
        on_view_change: function(mode: any) {
          console.log('View changed to:', mode);
        }
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize Gantt:', error);
      setError('Failed to initialize Gantt chart. Please refresh and try again.');
      setIsLoading(false);
    }
  }, [scriptsLoaded, ganttTasks, viewMode]);

  // Handle view mode changes
  const handleViewModeChange = useCallback((mode: string) => {
    setViewMode(mode);
    if (ganttInstanceRef.current && scriptsLoaded) {
      try {
        ganttInstanceRef.current.change_view_mode(mode);
      } catch (error) {
        console.error('Failed to change view mode:', error);
      }
    }
  }, [scriptsLoaded]);

  // Handle bulk actions
  const handleMarkAllComplete = useCallback(() => {
    if (ganttInstanceRef.current && scriptsLoaded) {
      ganttTasks.forEach(task => {
        try {
          ganttInstanceRef.current.update_task(task.id, { progress: 100 });
        } catch (error) {
          console.error('Failed to update task:', task.id, error);
        }
      });
      setGanttTasks(prev => prev.map(task => ({ ...task, progress: 100 })));
    }
  }, [ganttTasks, scriptsLoaded]);

  const handleResetProgress = useCallback(() => {
    if (ganttInstanceRef.current && scriptsLoaded) {
      ganttTasks.forEach(task => {
        try {
          ganttInstanceRef.current.update_task(task.id, { progress: 0 });
        } catch (error) {
          console.error('Failed to update task:', task.id, error);
        }
      });
      setGanttTasks(prev => prev.map(task => ({ ...task, progress: 0 })));
    }
  }, [ganttTasks, scriptsLoaded]);

  // No data state
  if (!ganttData || ganttData.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#111418] rounded-lg p-8 text-center">
          <h2 className="text-white text-xl font-bold mb-4">No Gantt Data Available</h2>
          <p className="text-[#9caaba] mb-4">The project plan doesn't contain timeline data for the Gantt chart.</p>
          <button
            onClick={onClose}
            className="bg-[#0b79ee] text-white px-4 py-2 rounded-lg hover:bg-[#0c5aa6] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#111418] rounded-lg p-8 text-center max-w-md">
          <h2 className="text-white text-xl font-bold mb-4">Error Loading Gantt Chart</h2>
          <p className="text-[#9caaba] mb-4">{error}</p>
          <button
            onClick={onClose}
            className="bg-[#0b79ee] text-white px-4 py-2 rounded-lg hover:bg-[#0c5aa6] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Load Frappe Gantt from CDN */}
      <Script 
        src="https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.umd.js"
        strategy="afterInteractive"
        onLoad={() => setScriptsLoaded(true)}
        onError={() => setError('Failed to load Gantt library')}
      />
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.css"
      />

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#111418] rounded-lg w-[95vw] h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#283039]">
            <div className="flex items-center gap-4">
              <h2 className="text-white text-xl font-bold">Project Gantt Chart</h2>
              <div className="flex gap-2">
                {['Day', 'Week', 'Month'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleViewModeChange(mode)}
                    disabled={!scriptsLoaded || isLoading}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === mode
                        ? 'bg-[#0b79ee] text-white'
                        : 'bg-[#283039] text-[#9caaba] hover:bg-[#3b4754]'
                    } ${(!scriptsLoaded || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
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

          {/* Gantt Chart Container */}
          <div className="flex-1 p-6 overflow-auto bg-[#1b2127]">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white">Loading Gantt Chart...</p>
                </div>
              </div>
            )}
            <div 
              id="gantt"
              ref={containerRef}
              className={`w-full h-full ${isLoading ? 'hidden' : ''}`}
              style={{ minHeight: '400px' }}
            />
          </div>

          {/* Progress Control Panel */}
          <div className="border-t border-[#283039] p-4 bg-[#1b2127]">
            <div className="flex items-center justify-between">
              <div className="text-white text-sm">
                <span className="font-medium">Interactive Timeline:</span>
                <span className="text-[#9caaba] ml-2">Click on tasks to view details. Drag to adjust dates or progress.</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleMarkAllComplete}
                  disabled={!scriptsLoaded || isLoading}
                  className={`px-4 py-2 bg-[#10b981] text-white rounded text-sm font-medium hover:bg-[#059669] transition-colors ${
                    (!scriptsLoaded || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Mark All Complete
                </button>
                
                <button
                  onClick={handleResetProgress}
                  disabled={!scriptsLoaded || isLoading}
                  className={`px-4 py-2 bg-[#6b7280] text-white rounded text-sm font-medium hover:bg-[#4b5563] transition-colors ${
                    (!scriptsLoaded || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Reset All Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Override Frappe Gantt styles for dark theme */
        #gantt .gantt-container {
          background: #1b2127 !important;
          font-family: inherit !important;
        }
        
        #gantt .grid-background {
          fill: #283039 !important;
        }
        
        #gantt .grid-row {
          fill: #1f2937 !important;
        }
        
        #gantt .tick {
          stroke: #374151 !important;
        }
        
        #gantt .tick.thick {
          stroke: #4b5563 !important;
        }
        
        #gantt text {
          fill: #9caaba !important;
          font-family: inherit !important;
        }
        
        #gantt .bar {
          fill: #0b79ee !important;
          rx: 3 !important;
        }
        
        #gantt .bar-progress {
          fill: #0c5aa6 !important;
        }
        
        #gantt .bar-label {
          fill: white !important;
          font-weight: 500 !important;
          font-size: 12px !important;
        }
        
        #gantt .bar-wrapper:hover .bar {
          fill: #1d4ed8 !important;
        }
        
        #gantt .arrow {
          fill: #6b7280 !important;
        }
        
        #gantt .pointer {
          fill: #9caaba !important;
        }
        
        #gantt .today-highlight {
          fill: #ef4444 !important;
          opacity: 0.1 !important;
        }
        
        #gantt .details-container {
          background: #283039 !important;
          color: white !important;
          padding: 12px !important;
          border-radius: 4px !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important;
        }
        
        #gantt .details-container h5 {
          margin: 0 0 8px 0 !important;
          font-size: 14px !important;
          font-weight: 600 !important;
        }
        
        #gantt .details-container p {
          margin: 4px 0 !important;
          font-size: 12px !important;
          color: #9caaba !important;
        }
        
        /* Handle scrollbar styling */
        #gantt::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        #gantt::-webkit-scrollbar-track {
          background: #1b2127;
        }
        
        #gantt::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 4px;
        }
        
        #gantt::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
    </>
  );
} 