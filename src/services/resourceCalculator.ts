import { ScheduleRow, WeeklyStat, ResourceBreakdown } from '../types/project';



export interface DailyResourceMap {
    [dateKey: string]: {
        [resId: string]: number;

    };
  }
  
  /**
   * Stage 1: The "Daily Grain"
   * This is the hardest working function in the app.
   */
export const calculateDailyResourceTotals = (
    data: ScheduleRow[],
    dateType: 'early' | 'baseline' = 'early'
): DailyResourceMap => {
    const dailyTotals: DailyResourceMap = {};

    data.forEach((row) => {
        // Toggle between Early Dates (es/ef) and Baseline Dates (bs/bf)
        const startStr = dateType === 'early' ? row.esDate : row.bsDate;
        const endStr = dateType === 'early' ? row.efDate : row.bfDate;
        
        const start = new Date(startStr);
        const end = new Date(endStr);
        const hours = row.resLevel;
        const resId = row.resId || 'Unassigned';

        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && hours > 0) {
            const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const dailyRate = hours / duration;

            for (let i = 0; i < duration; i++) {
                const current = new Date(start);
                current.setDate(start.getDate() + i);
                const dateKey = current.toISOString().split('T')[0];

                if (!dailyTotals[dateKey]) dailyTotals[dateKey] = { Total: 0 };

                    dailyTotals[dateKey][resId] = (dailyTotals[dateKey][resId] || 0) + dailyRate;
                    dailyTotals[dateKey].Total += dailyRate;
            }
        }
    });

    return dailyTotals;
};

export const getWeekIdentifier = (date: Date, weekEndingDay: number): string => {
    const d = new Date(date);
    const daysUntilEnd = (weekEndingDay - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + daysUntilEnd);
    return d.toISOString().split('T')[0];
};

/**
 * Stage 2: Grouping the Daily Grain into Weekly Buckets
 */
export const calculateWeeklyResourceTotals = (
    dailyMap: DailyResourceMap, 
    weekEndingDay: number
  ): WeeklyStat[] => {
    // We'll store the results in an object where the key is the week string
    const weeklyGroups: { [weekKey: string]: { total: number, breakdown: ResourceBreakdown } } = {};
  
    Object.entries(dailyMap).forEach(([dateKey, resourceData]) => {
      const weekKey = getWeekIdentifier(new Date(dateKey), weekEndingDay);
  
      // Initialize the week if it doesn't exist
      if (!weeklyGroups[weekKey]) {
        weeklyGroups[weekKey] = { total: 0, breakdown: {} };
      }
  
      // Add to the total and merge the resource breakdown
      Object.entries(resourceData).forEach(([resId, hours]) => {
        if (resId === 'Total') {
          weeklyGroups[weekKey].total += hours;
        } else {
          weeklyGroups[weekKey].breakdown[resId] = (weeklyGroups[weekKey].breakdown[resId] || 0) + hours;
        }
      });
    });
  
    // Map back to the WeeklyStat array format
    return Object.entries(weeklyGroups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([week, data]) => ({
        week,
        hours: data.total,
        breakdown: data.breakdown
      }));
  };