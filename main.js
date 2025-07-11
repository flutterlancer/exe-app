const { app, BrowserWindow, Menu, systemPreferences, ipcMain, session } = require('electron');
const path = require("path");
let getHWID;
(async () => {
    ({ getHWID } = await import("hwid"));
})();

let splash;
let mainWindow;

function createWindow() {
    Menu.setApplicationMenu(null);

    splash = new BrowserWindow({
        width: 300,
        height: 300,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    splash.loadFile(path.join(__dirname, 'splash.html'));

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, // recommended
        },
        // autoHideMenuBar: true,
        maximizable: false,
        minimizable: false,
        resizable: false,
        show: false // Don't show until ready
    });

    mainWindow.setContentProtection(true);

    // Inject custom header to ALL requests
    session.defaultSession.webRequest.onBeforeSendHeaders(async (details, callback) => {
        details.requestHeaders["language"] = "en-English";
        const deviceId = await getHWID;
        details.requestHeaders["x-safe-api"] = deviceId;
        callback({ requestHeaders: details.requestHeaders });
    });

    mainWindow.loadURL('https://lms.universityofmonetization.com');

    // Show main window and hide splash when loaded
    mainWindow.webContents.on('did-finish-load', () => {
        if (splash) splash.destroy();
        mainWindow.show();
    });

    // Handle load failure
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        if (splash) {
            splash.webContents.send('show-error', `Failed to load website: ${errorDescription} (${errorCode})`);
        }
    });
}

ipcMain.on('main-ready', () => {
    // No longer needed, handled by did-finish-load
});

if (process.platform === 'darwin') {
    const subId = systemPreferences.subscribeNotification(
        'com.apple.screenIsBeingCapturedDidChange',
        (event, userInfo) => {
            if (systemPreferences.getMediaAccessStatus('screen') === 'granted') {
                console.log('Screen is being captured!');
                mainWindow.hide();
            }
        }
    );
    app.on('will-quit', () => systemPreferences.unsubscribeNotification(subId));
}


// events to crete window
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
});

ipcMain.handle('get-device-id', async () => {
    return await getHWID;
});