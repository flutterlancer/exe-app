const { app, BrowserWindow, Menu, systemPreferences, ipcMain, session } = require('electron');
const path = require("path");
const { machineId: getHWID } = require('node-machine-id');

let splash;
let mainWindow;
let deviceId = null;

function createWindow() {
    // Menu.setApplicationMenu(null);

    // VM detection signals (pseudo)
    const os = require('os');
    if (os.hostname().toLowerCase().includes('vmware') || os.cpus()[0].model.includes('Virtual')) {
        app.quit(); // reject running
    }

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

    // Create a persistent session for user data
    const userSession = session.fromPartition('persist:userSession', {
        cache: true,
        persistent: true
    });

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            partition: "persist:userSession",
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.obf.js'),
            nodeIntegration: false, // recommended
            session: userSession,
        },
        // autoHideMenuBar: true,
        maximizable: false,
        minimizable: false,
        resizable: false,
        show: false // Don't show until ready
    });

    mainWindow.setContentProtection(true);

    // Get device ID first
    getHWID(true).then(id => {
        deviceId = id;
        console.log('Device ID obtained:', deviceId);
    }).catch(error => {
        console.error('Failed to get device ID:', error);
        deviceId = 'unknown';
    });

    // Inject custom header to ALL requests using the persistent session
    userSession.webRequest.onBeforeSendHeaders((details, callback) => {
        // Ensure headers object exists
        if (!details.requestHeaders) {
            details.requestHeaders = {};
        }

        // Set the Languege header (case-sensitive as per .htaccess)
        details.requestHeaders["language"] = "en-English";

        // Set device ID (use cached value or fallback)
        details.requestHeaders["x-safe-api"] = deviceId || 'unknown';

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

    mainWindow.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    mainWindow.addEventListener('keydown', function (e) {
        // Block DevTools shortcuts
        if (
            (e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl+Shift+I
            (e.ctrlKey && e.shiftKey && e.key === 'C') || // Ctrl+Shift+C
            (e.ctrlKey && e.shiftKey && e.key === 'J') || // Ctrl+Shift+J
            (e.ctrlKey && e.key === 'U') ||               // Ctrl+U
            (e.key === 'F12')                             // F12
        ) {
            e.preventDefault();
        }
    });

    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (
            input.control && input.shift && (
                input.key.toLowerCase() === 'i' || // Ctrl+Shift+I
                input.key.toLowerCase() === 'c' || // Ctrl+Shift+C
                input.key.toLowerCase() === 'j'    // Ctrl+Shift+J
            ) || input.key === 'F12'
        ) {
            event.preventDefault();
        }
    });

    mainWindow.webContents.on('devtools-opened', () => {
        mainWindow.webContents.closeDevTools(); // Immediately close if opened
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

// events to create window
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
    return await getHWID(true);
});

// Simple session management IPC handlers
ipcMain.handle('clear-session-data', async () => {
    try {
        await userSession.clearStorageData({
            storages: ['appcache', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage']
        });
        return { success: true, message: 'Session data cleared successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-session-info', async () => {
    try {
        const storageData = await userSession.getStorageData();
        return {
            success: true,
            data: storageData
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
});