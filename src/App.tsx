import React, { useState } from 'react';
import Papa from 'papaparse';

// Day 2 of 365 - Let's go!

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

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Work Tool: Import & Adjust</h1>
      
      <section style={{ marginBottom: '20px' }}>
        <button onClick={handleSelectFile} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Select File
        </button>
        {filePath && <p>Selected: {filePath}</p>}
      </section>
  
      <hr />
      
      <section>
        <div style={{ marginBottom: '20px', padding: '15px', background: '#f4f4f4', borderRadius: '8px' }}>
          <h3>Schedule Tools</h3>
          <button onClick={normalizeScheduleData}>Normalize Schedule Data</button>
          <button onClick={exportCSV} style={{ marginLeft: '10px', backgroundColor: '#28a745', color: 'white' }}>
            Export Adjusted CSV
          </button>
        </div>
  
        <div style={{ border: '1px solid #ccc', padding: '10px', overflow: 'auto', maxHeight: '300px' }}>
          {data.length > 0 ? (
            /* --- Data preview of first 10 rows. --- */
            <>
              <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                <strong>Status:</strong> {data.length.toLocaleString()} rows loaded. Showing preview of first 10.
              </p>
              <table>
                <thead>
                  <tr>{Object.keys(data[0]).map(key => <th key={key} style={{ textAlign: 'left', padding: '5px' }}>{key}</th>)}</tr>
                </thead>
                <tbody>
                  {data.slice(0, 10).map((row, i) => (
                    <tr key={i}>{Object.values(row).map((val: any, j) => <td key={j} style={{ padding: '5px' }}>{val}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </>

          ) : (
            <p>No data imported yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default App;