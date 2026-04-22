// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (content: string) => ipcRenderer.invoke('dialog:saveFile', content),
  saveProject: (content: string) => ipcRenderer.invoke('dialog:saveProject', content),
  exportCSV: (content: string) => ipcRenderer.invoke('dialog:exportCSV', content),
  importScout: () => ipcRenderer.invoke('dialog:importScout'),

  // New Listener: This lets React "listen" for menu clicks
  onMenuAction: (callback: (channel: string, data?: any) => void) => {
    
    ipcRenderer.removeAllListeners('menu:import-project');
    ipcRenderer.removeAllListeners('menu:open-file');
    ipcRenderer.removeAllListeners('menu:save-project');
    ipcRenderer.removeAllListeners('menu:export-csv');
    ipcRenderer.removeAllListeners('menu:set-week-end');

    ipcRenderer.on('menu:import-project', (event) => callback('import-project'));
    ipcRenderer.on('menu:open-file', () => callback('open-file'));
    ipcRenderer.on('menu:save-project', () => callback('save-project'));
    ipcRenderer.on('menu:export-csv', () => callback('export-csv'));
    ipcRenderer.on('menu:set-week-end', (event, val) => callback('set-week-end', val));
  },

  removeAllMenuListeners: () => {
    ipcRenderer.removeAllListeners('menu:import-project');
    ipcRenderer.removeAllListeners('menu:open-file');
    ipcRenderer.removeAllListeners('menu:save-project');
    ipcRenderer.removeAllListeners('menu:export-csv');
    ipcRenderer.removeAllListeners('menu:set-week-end');
  }
});

