import { SystemActivity, WeeklyStat, ResourceBreakdown } from '../types/project';



export interface DailyResourceMap {
    [dateKey: string]: {
        [resId: string]: number;

    };
};
  
const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);

};

export const calculateDailyResourceTotals = (
    data: SystemActivity[],
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

export const getWeekEndingDay = (dateStr: string, weekEndingDay: number): string => {
    const date = parseLocalDate(dateStr);
    const day = date.getDay();
    // Calculate how many days to add to get to the next 'weekEndingDay'
    const diff = (weekEndingDay - day + 7) % 7;
    
    // If diff is 0, it's already Friday, we keep it. 
    // Otherwise, we move it forward to the upcoming Friday.
    date.setDate(date.getDate() + diff);
    
    return date.toISOString().split('T')[0]; // Returns "YYYY-MM-DD"
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
      const weekKey = getWeekEndingDay(dateKey, weekEndingDay);
  
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