import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

import './index.css';
import DataTable from './components/DataTable';
import Histogram from './components/Histogram';
import MappingModal from './components/MappingModal'
import { SystemActivity } from './types/project';
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
      removeAllMenuListeners: () => void;
      importScout: () => Promise<any>;
      readRawFile: (filePath: string) => Promise<string>;
    };
  }
}


const transformCsvToSystemData = (
  rawData: any[], 
  fieldMap: Record<string, string>
): SystemActivity[] => {
  return rawData.map((row) => {
    const getValue = (systemKey: string): string => {
      const csvHeader = fieldMap[systemKey];
      return csvHeader ? (row[csvHeader] || '').trim() : '';
    };

    return {
      actId: getValue('actId'),
      actDesc: getValue('actDesc'),
      actType: getValue('actType') || 'Task',
      keyEvent: getValue('keyEvent') || 'None',
      
      origDur: Number(getValue('origDur')) || 0,
      remDur: Number(getValue('remDur')) || 0,
      percentComplete: Number(getValue('percentComplete')) || 0,
      percentPlanned: Number(getValue('percentPlanned')) || 0,
      totalFloat: Number(getValue('totalFloat')) || 0,
      
      resId: getValue('resId') || 'Unassigned',
      resLevel: Number(getValue('resLevel')) || 0,
      resCurve: 'Linear', 
      
      esDate: getValue('esDate'),
      efDate: getValue('efDate'),
      bsDate: getValue('bsDate') || getValue('esDate'), 
      bfDate: getValue('bfDate') || getValue('efDate'), 
    };
  });
};

const App = () => {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [weekEndingDay, setWeekEndingDay] = useState(5); // Default to Friday

  // --- NEW: MENU LISTENER ---
  useEffect(() => {
    window.electronAPI.onMenuAction((channel, val) => {
      if (channel === 'open-file') handleSelectFile();
      if (channel === 'import-project') handleStartImport();
      if (channel === 'save-project') handleSaveProject();
      if (channel === 'export-csv') handleExportCSV();
      if (channel === 'set-week-end') setWeekEndingDay(val);
    });
  
    // CLEANUP: Runs when the app or component is destroyed
    return () => {
      if (window.electronAPI.removeAllMenuListeners) {
        window.electronAPI.removeAllMenuListeners();
      }
    };
  }, []); // Empty array = "Only run on start-up"


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

  const [loadedProject, setLoadedProject] = useState<{
    name: string;
    id: string;
    statusDate: string;
  } | null>(null);

  const [scoutData, setScoutData] = useState(null);

  const handleStartImport = async () => {
    console.log("Starting Scout...");
    const data = await window.electronAPI.importScout();
    console.log("Scout Data Received:", data);
    if (data) setScoutData(data);
  };

  const handleConfirmImport = async (config: { metadata: any; fieldMap: Record<string, string> }) => {
    if (!scoutData) return;

    try {
      // 1. Fetch full raw file contents using the file path saved during the scout phase
      const rawContent = await window.electronAPI.readRawFile((scoutData as any).filePath);
      
      // 2. Parse the entire raw text file with headers enabled
      const parsed = Papa.parse(rawContent, {
        header: true,
        skipEmptyLines: true
      });

      // 3. Transform the raw CSV rows using the custom field mapping dictionary
      const mappedActivities = transformCsvToSystemData(parsed.data, config.fieldMap);

      // 4. Update the state data buckets to instantly refresh the charts and grid
      setData(mappedActivities);
      setFilePath((scoutData as any).filePath);
      setWeekEndingDay(Number(config.metadata.weekEndingDay));

      // 5. Commit project metadata to show up in your upper header container
      setLoadedProject({
        name: config.metadata.projectName,
        id: config.metadata.projectId,
        statusDate: config.metadata.statusDate
      });

      // 6. Tear down the mapping modal overlay
      setScoutData(null);
      alert(`Import complete! Loaded ${mappedActivities.length} activities.`);

    } catch (error) {
      console.error("Failed to parse full import file:", error);
      alert("An error occurred during file ingestion.");
    }
  };

  console.log(window);
  return (
    <div className="app-container">
      {/* 1. Subtle Status Header */}
      <header className="app-header">
      {loadedProject ? (
        <div className="project-info">
          <strong>{loadedProject.name}</strong> 
          <span className="divider">|</span> 
          Project ID: {loadedProject.id} 
          <span className="divider">|</span> 
          Status Date: {loadedProject.statusDate || 'Not Started'}
        </div>
      ) : (
        <div className="project-info">No Project Loaded: Use File {'>'} Import Project</div>
      )}
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
      {scoutData && (
        <MappingModal 
          scoutData={scoutData} 
          onCancel={() => setScoutData(null)}
          onConfirm={handleConfirmImport}
        />
      )}
    </div>
  );
};

export default App;

