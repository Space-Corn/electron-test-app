// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (content: string) => ipcRenderer.invoke('dialog:saveFile', content),
  saveProject: (content: string) => ipcRenderer.invoke('dialog:saveProject', content),
  exportCSV: (content: string) => ipcRenderer.invoke('dialog:exportCSV', content),

  // New Listener: This lets React "listen" for menu clicks
  onMenuAction: (callback: (channel: string, data?: any) => void) => {
    const subscription = (event: any, data: any) => callback(event.sender.id, data);
    // Listen for specific channels we defined in the menu
    ipcRenderer.on('menu:open-file', () => callback('open-file'));
    ipcRenderer.on('menu:save-project', () => callback('save-project'));
    ipcRenderer.on('menu:export-csv', () => callback('export-csv'));
    ipcRenderer.on('menu:set-week-end', (event, val) => callback('set-week-end', val));
  }
});