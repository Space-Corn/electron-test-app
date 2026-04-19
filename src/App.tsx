import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

import './index.css';
import DataTable from './components/DataTable';
import Histogram from './components/Histogram';
import { ScheduleRow } from './types/project';
import { processRawData, sanitizeDate } from './services/dataProcessor';
import { createProjectPayload } from './services/projectService';

declare global {
  interface Window {
    electronAPI: {
      openFile: () => Promise<{ filePath: string; content: string } | null>;
      saveFile: (content: string) => Promise<boolean>;
      saveProject: (content: string) => Promise<boolean>;
      exportCSV: (content: string) => Promise<boolean>;
      onMenuAction: (callback: (channel: string, data?: any) => void) => void;
    };
  }
}

const App = () => {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [weekEndingDay, setWeekEndingDay] = useState(5); // Default to Friday

  // --- NEW: MENU LISTENER ---
  useEffect(() => {
    window.electronAPI.onMenuAction((channel, val) => {
      if (channel === 'open-file') handleSelectFile();
      if (channel === 'save-project') handleSaveProject();
      if (channel === 'export-csv') handleExportCSV();
      if (channel === 'set-week-end') setWeekEndingDay(val);
    });
  }, [data, weekEndingDay, filePath]); // Re-bind when data changes so handlers have latest state


  const handleSelectFile = async () => {
    const result = await window.electronAPI?.openFile();
    
    if (result && result.content && result.filePath) {
      const extension =result.filePath.split(".").pop()?.toLowerCase();

      if ( extension === "csv"){
         // parse csv file with Papa.parse, and run it through processRawData to get cleanData.
      const parsed = Papa.parse(result.content, { 
        header: true,
        skipEmptyLines: true 
      });
  
      // 2. Convert the "dirty" array into clean data format
      // This is our data cleaner in dataProcessor.ts
      const cleanData = processRawData(parsed.data);

      // 3. Save the clean data to your state
      setData(cleanData);
      setFilePath(result.filePath);

      } else if (extension === 'json'){
        // detect if its a fake JSON file
        try {
          const projectData = JSON.parse(result.content);
          if (!projectData.scheduleData) {
            throw new Error('Invalid project file format.');
          }
          
            // we need to handle our json projectData
          setData(projectData.scheduleData);
          setWeekEndingDay(projectData.settings.weekEndingDay);
          setFilePath(result.filePath);
          alert("Project loaded successfully!");
        } catch (error){
          console.error("Load error:", error);
          alert('Failed to load project: the project may be in the wrong format.')
        }

      } else {
        alert('Unsupported file type detected. Please either select a JSON or CSV file.');
      }
    }
  };

  const handleSaveProject = async () => {
    const payload = createProjectPayload(data, weekEndingDay, filePath);
    const jsonString = JSON.stringify(payload, null, 2); // The '2' makes it readable
    await window.electronAPI.saveProject(jsonString);
  };
  
  const handleExportCSV = async () => {
    const csvString = Papa.unparse(data);
    const success = await window.electronAPI.exportCSV(csvString);

    if (success) {
      alert("File Exported Successfully!");
    }
  };

  console.log(window);
  return (
    <div className="app-container">
      {/* 1. Subtle Status Header */}
      <header className="app-header">
        <span className="brand">Schedule Resource Prototype</span>
        <span className="file-info">{filePath ? `Editing: ${filePath}` : "No file loaded (Cmd+O to import)"}</span>
      </header>

      <main className="main-layout">
        {/* 2. TOP PANE: The Data Table */}
        <section className="table-pane">
          <DataTable data={data} />
        </section>

        {/* 3. BOTTOM PANE: The Histogram */}
        <section className="histogram-pane">
          <Histogram data={data} weekEndingDay={weekEndingDay} />
        </section>
      </main>
    </div>
  );
};

export default App;

