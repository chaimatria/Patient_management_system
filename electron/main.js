const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    });

    if (isDev) {
        const devUrl = 'http://localhost:3000';
        console.log('Loading dev server at:', devUrl);
        mainWindow.loadURL(devUrl);
        
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
    } else {
        const indexPath = path.join(__dirname, '../out/index.html');
        console.log('Loading production build from:', indexPath);
        mainWindow.loadFile(indexPath);
    }

    // Handle window errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription);
        if (isDev) {
            console.log('Make sure Next.js dev server is running on port 3000');
        }
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});