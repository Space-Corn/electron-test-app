import { ScheduleRow } from '../types/project';


/**
 * Ensures dates are stored as ISO strings (YYYY-MM-DD).
 * Handles raw strings like "15-Apr-26", "04/15/2026", or empty values.
 */
export const sanitizeDate = (raw: any): string => {
    if (!raw || raw === "") return "";
    
    const d = new Date(raw);
    
    // If JavaScript's Date object can't parse it, return empty string
    // to prevent "Invalid Date" from breaking the app.
    if (isNaN(d.getTime())) return "";
  
    // returns "YYYY-MM-DD"
    return d.toISOString().split('T')[0];
  };
  

  /**
   * Strips non-numeric characters (%, $, commas) and returns a clean number.
   * Ensures the app doesn't crash if a field is accidentally left blank.
   */
  export const sanitizeNumber = (raw: any): number => {
    if (typeof raw === 'number') return raw;
    if (!raw) return 0;
  
    // Remove everything except numbers and decimals
    const clean = String(raw).replace(/[^-0.9.]/g, '');
    const num = parseFloat(clean);
  
    return isNaN(num) ? 0 : num;
  };


/**
 * Standardizes various time strings (7d, 16h, 480t) into a base unit of DAYS.
 * Assumptions: 8h = 1d, 60t = 1h (480t = 1d).
 */
export const normalizeToDays = (raw: any): number => {
    if (typeof raw === 'number') return raw;
    const input = String(raw).toLowerCase().trim();
    
    // Extract the numeric part and the unit part
    const match = input.match(/^(\d+\.?\d*)\s*([a-z]*)$/);
    if (!match) return 0;

    const val = parseFloat(match[1]);
    const unit = match[2];

    switch (unit) {
    case 'h': // Hours
        return val / 8;
    case 't': // Minutes (common in some scheduling exports)
        return val / 480; 
    case 'd': // Days
    default:
        return val;
    }
};

export const processRawData = (rawRows: any[]): ScheduleRow[] => {
    return rawRows.map((row, index) => {
    return {
        // Identity & Description
        actId: String(row['Activity ID'] || row['ID'] || index),
        actType: String(row['Activity Type'] || ""),
        actDesc: String(row['Activity Name'] || row['Description'] || ""),
        
        // Durations (using our new time normalizer)
        origDur: normalizeToDays(row['Original Duration']),
        remDur: normalizeToDays(row['Remaining Duration']),
        
        // Percentages (standardizing to 0.0 - 1.0 range)
        percentComp: sanitizeNumber(row['Activity % Complete']) / 100,
        percentPlan: sanitizeNumber(row['Performance % Complete']) / 100,
        
        // Scheduling Dates
        esDate: sanitizeDate(row['ES_Date']),
        efDate: sanitizeDate(row['EF_Date']),
        bsDate: sanitizeDate(row['BS_Date']),
        bfDate: sanitizeDate(row['BF_Date']),
        
        // Resource & Math
        resId: String(row['Res_ID'] || 'Unassigned'),
        totFloat: sanitizeNumber(row['Total Float']),
        resLevel: sanitizeNumber(row['Res_Level']),
        resCurve: String(row['Resource Curve'] || 'Linear'),
        
        // The "Safety Net"
        originalData: row 
    };
    });
};