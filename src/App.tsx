import React, { useState, useEffect, useRef } from 'react';
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
  // --- 1. ALL STATE & REF DECLARATIONS MOVE TO THE TOP ---
  const [filePath, setFilePath] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [weekEndingDay, setWeekEndingDay] = useState(5); // Default to Friday
  const [currentFieldMap, setCurrentFieldMap] = useState<Record<string, string>>({});
  const [scoutData, setScoutData] = useState(null);
  
  // Moved up here so everything below can see it safely!
  const [loadedProject, setLoadedProject] = useState<{
    name: string;
    id: string;
    statusDate: string;
  } | null>(null);

  const savePayloadRef = useRef<any>(null);

  // --- 2. KEEP MIRROR UPDATED ---
  useEffect(() => {
    savePayloadRef.current = {
      projectMetadata: {
        // 🛡️ APPLICATION SIGNATURE TAGS
        fileSignature: "INTEGRATED-SCHEDULE-ANALYTICS-ENGINE",
        fileVersion: "1.0.0",

        projectName: loadedProject?.name || "New Project",
        projectId: loadedProject?.id || "No ID",
        statusDate: loadedProject?.statusDate || "No Date"
      },
      settings: {
        weekEndingDay: weekEndingDay,
        fieldMap: currentFieldMap
      },
      scheduleData: data
    };
  }, [data, currentFieldMap, loadedProject, weekEndingDay]);

  // --- 3. MENU LISTENER (WIRED TO SYSTEM SCOREBOARD) ---
  useEffect(() => {
    window.electronAPI.onMenuAction((channel, val) => {
      if (channel === 'open-file') handleSelectFile();
      if (channel === 'import-project') handleStartImport();
      if (channel === 'save-project') handleSaveProject();
      if (channel === 'export-csv') handleExportCSV();
      if (channel === 'set-week-end') setWeekEndingDay(val);
    });
  
    return () => {
      if (window.electronAPI.removeAllMenuListeners) {
        window.electronAPI.removeAllMenuListeners();
      }
    };
  }, []); 


  const handleSelectFile = async () => {
    const result = await window.electronAPI?.openFile();
    
    if (result && result.content && result.filePath) {
      const extension = result.filePath.split(".").pop()?.toLowerCase();

      if (extension === "csv"){
        const parsed = Papa.parse(result.content, { 
          header: true,
          skipEmptyLines: true 
        });
    
        const cleanData = processRawData(parsed.data);
        setData(cleanData);
        setFilePath(result.filePath);

      } else if (extension === 'json') {
        try {
          const projectData = JSON.parse(result.content);
          
          // 🛑 THE NEW STRICT SIGNATURE CHECK
          const hasValidSignature = 
            projectData?.projectMetadata?.fileSignature === "INTEGRATED-SCHEDULE-ANALYTICS-ENGINE";

          if (!hasValidSignature) {
            throw new Error('Unauthorized or unrecognized file generator signature.');
          }
          
          // If the signature passes, safely ingest the data fields below
          setData(projectData.scheduleData);
          setWeekEndingDay(Number(projectData.settings.weekEndingDay) || 5);
          setFilePath(result.filePath);
          setCurrentFieldMap(projectData.settings.fieldMap);
          
          setLoadedProject({
            name: projectData.projectMetadata.projectName,
            id: projectData.projectMetadata.projectId,
            statusDate: projectData.projectMetadata.statusDate
          });

          alert(`Project "${projectData.projectMetadata.projectName}" verified and loaded!`);

        } catch (error) {
          console.error("Load validation error:", error);
          alert('Failed to load project: This file was not created by this application or is an incompatible version.');
        }

      } else {
        alert('Unsupported file type detected. Please either select a JSON or CSV file.');
      }
    }
  };

  const handleSaveProject = async () => {
    if (!savePayloadRef.current) {
      console.log("No payload compiled yet.");
      return;
    }

    // Diagnostic tracking
    console.log("NATIVE MENU SAVE EXECUTION - Payload State:", savePayloadRef.current);

    const jsonString = JSON.stringify(savePayloadRef.current, null, 2);
    await window.electronAPI.saveProject(jsonString);
  };
  
  const handleExportCSV = async () => {
    const csvString = Papa.unparse(data);
    const success = await window.electronAPI.exportCSV(csvString);

    if (success) {
      alert("File Exported Successfully!");
    }
  };

  const handleStartImport = async () => {
    console.log("Starting Scout...");
    const data = await window.electronAPI.importScout();
    console.log("Scout Data Received:", data);
    if (data) setScoutData(data);
  };

  const handleConfirmImport = async (config: { metadata: any; fieldMap: Record<string, string> }) => {
    if (!scoutData) return;

    try {
      const rawContent = await window.electronAPI.readRawFile((scoutData as any).filePath);
      
      const parsed = Papa.parse(rawContent, {
        header: true,
        skipEmptyLines: true
      });

      const mappedActivities = transformCsvToSystemData(parsed.data, config.fieldMap);

      setData(mappedActivities);
      setFilePath((scoutData as any).filePath);
      setWeekEndingDay(Number(config.metadata.weekEndingDay));
      setCurrentFieldMap(config.fieldMap);

      setLoadedProject({
        name: config.metadata.projectName,
        id: config.metadata.projectId,
        statusDate: config.metadata.statusDate
      });

      setScoutData(null);
      alert(`Import complete! Loaded ${mappedActivities.length} activities.`);

    } catch (error) {
      console.error("Failed to parse full import file:", error);
      alert("An error occurred during file ingestion.");
    }
  };

  return (
    <div className="app-container">
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
        <section className="table-pane">
          <DataTable data={data} />
        </section>

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