export interface ScheduleRow {
    actId: string;
    actType: string;
    actDesc: string;
    // Normalized to numbers for math later (e.g. 5 instead of "5d")
    origDur: number; 
    remDur: number;
    // Percentages are best as decimals (0.54 instead of "54%")
    percentComp: number;
    percentPlan: number;
    resId: string;
    // Dates stay as ISO strings "YYYY-MM-DD"
    esDate: string;
    efDate: string;
    bsDate: string;
    bfDate: string;
    // Float is vital for scheduling logic—keep it as a number!
    totFloat: number;
    resLevel: number;
    resCurve: string; // e.g., "Linear", "Back Loaded"
    originalData: any; 
}