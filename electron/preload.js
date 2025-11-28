// electron/preload.js
// This file runs in the renderer process before the web page loads
// It has access to both DOM APIs and Node.js APIs

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Patient operations
  getPatients: () => ipcRenderer.invoke('patients:get'),
  addPatient: (patient) => ipcRenderer.invoke('patients:add', patient),
  editPatient: (patient) => ipcRenderer.invoke('patients:edit', patient),
  deletePatient: (patientId) => ipcRenderer.invoke('patients:delete', patientId),
});

