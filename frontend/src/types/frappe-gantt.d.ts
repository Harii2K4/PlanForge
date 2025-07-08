declare module 'frappe-gantt' {
  interface GanttTask {
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    dependencies?: string[];
  }

  interface GanttOptions {
    view_mode?: string;
    date_format?: string;
    popup?: ((task: any) => string | false | undefined) | false;
    bar_height?: number;
    bar_corner_radius?: number;
    arrow_curve?: number;
    padding?: number;
    view_modes?: string[];
    today_button?: boolean;
    view_mode_select?: boolean;
    readonly?: boolean;
    readonly_progress?: boolean;
    readonly_dates?: boolean;
    custom_popup_html?: any;
  }

  class Gantt {
    constructor(element: string | HTMLElement, tasks: GanttTask[], options?: GanttOptions);
    change_view_mode(mode: string): void;
    refresh(tasks: GanttTask[]): void;
    scroll_current(): void;
    destroy?(): void;
  }

  export default Gantt;
} 