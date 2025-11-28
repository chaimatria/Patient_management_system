const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';
const fs = require("fs");
const { ipcMain } = require("electron");

const dataPath = path.join(__dirname, "data", "patients.json");

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false,
            sandbox: false,
        },
        show: false, // Don't show until ready
    });

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus(); // Ensure window has focus
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000'); // Next.js dev server
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../out/index.html')); // Production build
    }

    // Ensure window can receive focus and handle input
    mainWindow.on('focus', () => {
        mainWindow.webContents.focus();
    });
}


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
}

);

ipcMain.handle("patients:get", () => {
  const data = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(data);
});

ipcMain.handle("patients:add", (event, patient) => {
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  data.push(patient);
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  return data;
});


ipcMain.handle("patients:edit", (event, updatedPatient) => {
  let data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  data = data.map((p) =>
    p.patientId === updatedPatient.patientId ? updatedPatient : p
  );

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  return data;
});


ipcMain.handle("patients:delete", (event, patientId) => {
  let data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  data = data.filter((p) => p.patientId !== patientId);

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  return data;
});
