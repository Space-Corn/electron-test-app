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
    const clean = String(raw).replace(/[^-0-9.]/g, '');
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
    return rawRows.map((row, index) => ({
      actId: String(row['Activity ID'] || row['actId'] || index),
      actType: String(row['Activity Type'] || row['actType'] || ""),
      actDesc: String(row['Activity Name'] || row['actDesc'] || ""),
      origDur: normalizeToDays(row['origDur']),
      remDur: normalizeToDays(row['remDur']),
      percentComplete: sanitizeNumber(row['percentComplete']) / 100,
      percentPlanned: sanitizeNumber(row['percentPlanned']) / 100,
      resId: String(row['resId'] || 'Unassigned'),
      esDate: sanitizeDate(row['esDate']),
      efDate: sanitizeDate(row['efDate']),
      bsDate: sanitizeDate(row['bsDate']),
      bfDate: sanitizeDate(row['bfDate']),
      totalFloat: sanitizeNumber(row['totalFloat']),
      resLevel: sanitizeNumber(row['resLevel']),
      resCurve: String(row['resCurve'] || 'Linear'),
      keyEvent: String(row['keyEvent']),
      originalData: row 
    }));
  };
