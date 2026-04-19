import { ScheduleRow, WeeklyStat } from '../types/project';



export interface DailyResourceMap {
    [dateKey: string]: number;
  }
  
  /**
   * Stage 1: The "Daily Grain"
   * This is the hardest working function in the app.
   */
export const calculateDailyResourceTotals = (data: ScheduleRow[]): DailyResourceMap => {
    const dailyTotals: DailyResourceMap = {};

    data.forEach((row) => {
    const start = new Date(row.esDate);
    const end = new Date(row.efDate);
    const hours = row.resLevel;

    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && hours > 0) {
        const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const dailyRate = hours / duration;

        for (let i = 0; i < duration; i++) {
        const current = new Date(start);
        current.setDate(start.getDate() + i);
        const dateKey = current.toISOString().split('T')[0];

        dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + dailyRate;
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
    weekEndingDay: number //
): WeeklyStat[] => {
    const weeks: { [key: string]: number } = {};

    Object.entries(dailyMap).forEach(([dateKey, hours]) => {
        // We convert the date string back to a Date object to find its week-ending date
        const weekKey = getWeekIdentifier(new Date(dateKey), weekEndingDay);
        
        weeks[weekKey] = (weeks[weekKey] || 0) + hours;
    });

    // Convert the object back into a sorted array for the Histogram to map over
    return Object.entries(weeks)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([week, hours]) => ({ week, hours }));
};