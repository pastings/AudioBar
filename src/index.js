const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

let mainWindow;

function createAudioBar() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    mainWindow = new BrowserWindow({
        width: 900,
        height: 250,
        transparent: true,
        frame: false,
        resizable: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    
}

app.whenReady().then(() => {
    createAudioBar();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createAudioBar();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
