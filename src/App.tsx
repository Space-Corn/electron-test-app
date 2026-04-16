import React, { useState } from 'react';
import Papa from 'papaparse';


import Histogram from './components/Histogram';
import { ScheduleRow } from './types/project';
import { processRawData, sanitizeDate } from './services/dataProcessor';



const App = () => {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);


  const handleSelectFile = async () => {
    const result = await (window as any).electronAPI.openFile();
    
    if (result && result.content) {
      // 1. Parse the raw string into a generic array of objects
      const parsed = Papa.parse(result.content, { 
        header: true,
        skipEmptyLines: true 
      });
  
      // 2. Convert the "dirty" array into your "Ground Truth"
      // This uses the function we just moved to dataProcessor.ts
      const cleanData = processRawData(parsed.data);

      // 3. Save the clean data to your state
      setData(cleanData);
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

