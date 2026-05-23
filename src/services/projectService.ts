import { ProjectFile, SystemActivity } from '../types/project';



export const createProjectPayload = (
  data: SystemActivity[], 
  weekEndingDay: number, 
  filePath: string | null
): ProjectFile => {
  return {
    version: "1.0.0",
    lastModified: new Date().toISOString(),
    settings: {
      weekEndingDay,
      originalFilePath: filePath
    },
    scheduleData: data
  };
};

export const transformCsvToSystemData = (
  rawData: any[], 
  fieldMap: Record<string, string>
): SystemActivity[] => {
  return rawData.map((row) => {
    // Helper to extract a column value if mapped safely
    const getValue = (systemKey: string): string => {
      const csvHeader = fieldMap[systemKey];
      return csvHeader ? (row[csvHeader] || '').trim() : '';
    };

    // Build out a perfectly verified SystemActivity object matching your interface
    return {
      actId: getValue('actId'),
      actDesc: getValue('actDesc'),
      actType: getValue('actType') || 'Task',
      keyEvent: getValue('keyEvent') || 'None',
      
      // Numbers require strict parsing so your math doesn't break down later
      origDur: Number(getValue('origDur')) || 0,
      remDur: Number(getValue('remDur')) || 0,
      percentComplete: Number(getValue('percentComplete')) || 0,
      percentPlanned: Number(getValue('percentPlanned')) || 0,
      totalFloat: Number(getValue('totalFloat')) || 0,
      
      resId: getValue('resId') || 'Unassigned',
      resLevel: Number(getValue('resLevel')) || 0,
      resCurve: 'Linear', // Default standard distribution curve fallback
      
      // Strict layout synchronization for dates
      esDate: getValue('esDate'),
      efDate: getValue('efDate'),
      bsDate: getValue('bsDate') || getValue('esDate'), // fallback to early start if unmapped
      bfDate: getValue('bfDate') || getValue('efDate'), // fallback to early finish if unmapped
    };
  });
};