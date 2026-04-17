import React, { useState } from 'react';
import Papa from 'papaparse';

import './index.css';
import DataTable from './components/DataTable';
import Histogram from './components/Histogram';
import { ScheduleRow } from './types/project';
import { processRawData, sanitizeDate } from './services/dataProcessor';

declare global {
  interface Window {
    electronAPI: {
      openFile: () => Promise<{ filePath: string; content: string } | null>;
      saveFile: (content: string) => Promise<boolean>;
    };
  }
}

const App = () => {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);


  const handleSelectFile = async () => {
    const result = await window.electronAPI?.openFile();
    
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
 
    const success = await window.electronAPI?.saveFile(csvString);
    if (success) {
    alert("File Exported Successfully!");
    }
  };

  const [weekEndingDay, setWeekEndingDay] = useState(5); // Default to Friday

  console.log(window);
  return (
    <div className="app-container">
      {/*Top Menu Bar, file optons for controls */}
      <header className="menu-bar">
        <div className="brand">Schedule Resource Prototype</div>
        <div className="file-status">{filePath || "No File Loaded"}</div>
        <div className="actions">
          {data.length > 0 && (
          <button onClick={exportCSV} className="export-btn">
            Export CSV
          </button>
          )}
        </div>
      </header>

      {/* 2. UPPER LEFT: Controls & Configuration */}
      <section className="scroll-pane top-left-container">
        <h3>Project Controls</h3>
        <button onClick={handleSelectFile} className="import-btn">
          Import CSV
        </button>

        <div className="control-group">
          <label>Week Ending Day:</label>
          <select value={weekEndingDay} onChange={(e) => setWeekEndingDay(parseInt(e.target.value))}>
            <option value={1}>Monday</option>
            <option value={2}>Tuesday</option>
            <option value={3}>Wednesday</option>
            <option value={4}>Thursday</option>
            <option value={5}>Friday</option>
            <option value={6}>Saturday</option>
            <option value={0}>Sunday</option>
          </select>
        </div>
      </section>

      {/* 3. UPPER RIGHT: Data Table View */}
      <section className="scroll-pane top-right-container">
        <h3>Schedule Data</h3>
          <DataTable data={data} />

      </section>
      {/* 4. BOTTOM: Full-Width Histogram Stage */}
      <footer className="histogram-container">
        <div className="histogram-header">
          <h3>Schedule Resource Distribution</h3>
        </div>
        <div className="histogram-stage">
          <Histogram data={data} weekEndingDay={weekEndingDay} />
        </div>
      </footer>
    </div>
  );
};

export default App;

