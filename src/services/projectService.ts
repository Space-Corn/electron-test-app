import { ProjectFile, ScheduleRow } from '../types/project';



export const createProjectPayload = (
  data: ScheduleRow[], 
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