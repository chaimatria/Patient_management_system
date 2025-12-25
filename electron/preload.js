// Preload script for Electron
// This file is required by main.js but currently no IPC handlers are needed
// since the app uses Next.js API routes instead of Electron IPC

const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// the contextBridge APIs without exposing Node.js internals
contextBridge.exposeInMainWorld('electron', {
  // Add IPC methods here if needed in the future
  // For now, this is just a placeholder to prevent Electron errors
});

