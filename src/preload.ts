import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (content: string) => ipcRenderer.invoke('dialog:saveFile', content),
  saveProject: (content: string) => ipcRenderer.invoke('dialog:saveProject', content),
  exportCSV: (content: string) => ipcRenderer.invoke('dialog:exportCSV', content),
  importScout: () => ipcRenderer.invoke('dialog:importScout'),
  readRawFile: (filePath: string) => ipcRenderer.invoke('file:readRaw', filePath),

  // 🧹 CLEAN & CONSISTENT IPC PASSTHROUGH 
  onMenuAction: (callback: (channel: string, data?: any) => void) => {
    ipcRenderer.removeAllListeners('open-file');
    ipcRenderer.removeAllListeners('import-project');
    ipcRenderer.removeAllListeners('save-project');
    ipcRenderer.removeAllListeners('export-csv');
    ipcRenderer.removeAllListeners('set-week-end');

    ipcRenderer.on('open-file', () => callback('open-file'));
    ipcRenderer.on('import-project', () => callback('import-project'));
    ipcRenderer.on('save-project', () => callback('save-project'));
    ipcRenderer.on('export-csv', () => callback('export-csv'));
    ipcRenderer.on('set-week-end', (event, val) => callback('set-week-end', val));
  },

  removeAllMenuListeners: () => {
    ipcRenderer.removeAllListeners('open-file');
    ipcRenderer.removeAllListeners('import-project');
    ipcRenderer.removeAllListeners('save-project');
    ipcRenderer.removeAllListeners('export-csv');
    ipcRenderer.removeAllListeners('set-week-end');
  }
});