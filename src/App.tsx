import React, { useState } from 'react';
import Papa from 'papaparse';

import Histogram from './components/Histogram';

// Day 3 of 365, testing git push some more.

const normalizeDate = (dateStr: string): string => {
  if (!dateStr || dateStr.trim() === "") return "";
  const cleanStr = dateStr.trim();

  // Handle DMonYYYY or DMonYY (e.g., 13Apr2026 or 13Apr26)
  const dMonRegex = /^(\d{1,2})([a-zA-Z]{3})(\d{2,4})$/;
  const match = cleanStr.match(dMonRegex);

  if (match) {
    const [_, day, month, year] = match;
    const parsed = new Date(`${day} ${month} ${year}`);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  }

  // Fallback for standard formats (M/D/YY, etc.)
  const date = new Date(cleanStr);
  return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : dateStr;
};

const detectPercentFormat = (rows: any[], field: string) => {
  for (let row of rows) {
    const val = String(row[field] || "").trim();
    // Skip non-informative values
    if (val === "" || val === "0" || val === "0.00" || val === "0%") continue;

    if (val.includes('%')) return 'PERCENT_STRING'; // "54.37%"
    if (parseFloat(val) > 1) return 'WHOLE_NUMBER'; // "54.37"
    return 'DECIMAL'; // "0.5437"
  }
  return 'DECIMAL'; 
};

const App = () => {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  const normalizeScheduleData = () => {
    if (data.length === 0) return;
  
    // Define the columns that need special treatment
    const dateFields = ['ES_Date', 'EF_Date', 'BS_Date', 'BF_Date'];
    const percentFields = ['Percent_Complete', 'Percent_Planned'];
  
    // Identify the percentage "mode" for this specific file
    const percentMode = detectPercentFormat(data, percentFields[0]);
  
    const adjusted = data.map(row => {
      const newRow = { ...row };
  
      // 1. Fix Dates
      dateFields.forEach(field => {
        if (newRow[field]) {
          newRow[field] = normalizeDate(newRow[field]);
        }
      });
  
      // 2. Fix Percentages
      percentFields.forEach(field => {
        let rawVal = String(newRow[field] || "0").replace('%', '').trim();
        let num = parseFloat(rawVal);
  
        if (isNaN(num)) {
          newRow[field] = "0.0000";
        } else if (percentMode === 'PERCENT_STRING' || percentMode === 'WHOLE_NUMBER') {
          // Convert "54" or "54%" to "0.5400"
          newRow[field] = (num / 100).toFixed(4);
        } else {
          // Already a decimal like "0.5437", just clean up precision
          newRow[field] = num.toFixed(4);
        }
      });
  
      return newRow;
    });
  
    setData(adjusted);
    alert("Data Normalized: Dates standardized and Percentages converted to decimals.");
  };

  const handleSelectFile = async () => {
    const result = await (window as any).electronAPI.openFile();
    
    if (result && result.content) {
      // result.content is the string we read in index.ts
      const parsed = Papa.parse(result.content, { 
        header: true,
        skipEmptyLines: true // This helps with those extra newlines at the end
      });
  
      setData(parsed.data);
      setFilePath(result.filePath);
    }
  };

  const exportCSV = async () => {
    const csvString = Papa.unparse(data);
    // We'll need to create this saveFile bridge in a moment
    await (window as any).electronAPI.saveFile(csvString);
    alert("File Exported Successfully!");
  };

  const [weekEnding, setWeekEnding] = useState(5); // Default to Friday

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* LEFT SIDEBAR: Controls & Status */}
      <aside style={{ 
        width: '300px', 
        padding: '20px', 
        borderRight: '1px solid #ccc', 
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        
        <h2>Work Tool</h2>
        
        <button onClick={handleSelectFile}>Select File</button>
        {filePath && <p style={{fontSize: '12px', wordBreak: 'break-all'}}>{filePath}</p>}

        <label>Week Ending On:</label>
        <select value={weekEnding} onChange={(e) => setWeekEnding(parseInt(e.target.value))}>
          <option value={1}>Monday</option>
          <option value={2}>Tuesday</option>
          <option value={3}>Wednesday</option>
          <option value={4}>Thursday</option>
          <option value={5}>Friday</option>
          <option value={6}>Saturday</option>
          <option value={0}>Sunday</option>
        </select>
        
        <hr style={{width: '100%'}} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={normalizeScheduleData}>Normalize Data</button>
          <button onClick={exportCSV} style={{ backgroundColor: '#28a745', color: 'white' }}>
            Export CSV
          </button>
        </div>
      </aside>
  
      {/* RIGHT STAGE: Visualizations & Data Preview */}
      <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        
        {/* AREA 1: Visualizations (Your next task!) */}
        <section style={{ marginBottom: '30px', minHeight: '200px', border: '2px dashed #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Histogram data={data} weekEndingDay={weekEnding} />
        </section>
  
        {/* AREA 2: Data Preview */}
        <section>
          {data.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <p><strong>Status:</strong> {data.length.toLocaleString()} rows loaded.</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr>{Object.keys(data[0]).map(key => <th key={key} style={{ textAlign: 'left', padding: '5px' }}>{key}</th>)}</tr>
                </thead>
                <tbody>
                  {data.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} style={{ padding: '5px' }}>
                          {val !== null ? String(val) : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Import a file to see the data preview.</p>
          )}
        </section>
      </main>
  
    </div>
  );
};

export default App;

