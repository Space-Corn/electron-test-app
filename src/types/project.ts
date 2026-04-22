export interface SystemActivity {
  // Identity
  actId: string;
  actType: string;
  actDesc: string;
  keyEvent: string;

  // Progress & Duration
  origDur: number;
  remDur: number;
  percentComplete: number;
  percentPlanned: number;
  totalFloat: number;

  // Resource Logic
  resId: string;
  resLevel: number; // The "Y-axis" value
  resCurve: 'Linear' | 'Back Loaded' | 'Front Loaded' | 'S-Curve'; // Made this a union type for better safety

  // Dates (Strict ISO "YYYY-MM-DD")
  esDate: string;
  efDate: string;
  bsDate: string;
  bfDate: string;
}

export interface ImportMap {
  // Map of SystemField -> CSVHeaderName
  // Example: { actId: "Activity ID", actDesc: "Description" }
  fieldMap: Record<keyof Omit<SystemActivity, 'resCurve'>, string>;
  
  // Global Project Metadata from the Dialog
  projectMetadata: {
      projectName: string;
      projectId: string;
      projectOwner: string;
      startDate: string;
      endDate: string;
      statusDate: string;
      updatePeriod: 'Weekly' | 'Monthly';
      weekEndingDay: number; // 0-6
  };

  // Date Format Helper
  csvDateFormat: string; // e.g., "MM/DD/YYYY"
}

export interface ResourceBreakdown {
  [resId: string]: number;
}

export interface WeeklyStat {
  week: string;
  hours: number;
  breakdown: ResourceBreakdown;
}

export interface ProjectFile {
    version: string;           // Useful if you add features later and need to track "old" saves
    lastModified: string;
    settings: {
      weekEndingDay: number;
      originalFilePath: string | null;
    };
    scheduleData: SystemActivity[];
  }