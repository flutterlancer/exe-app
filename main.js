const { app, BrowserWindow, Menu, systemPreferences, ipcMain, session } = require('electron');
const path = require("path");
const { machineId: getHWID } = require('node-machine-id');
const http = require('http');
const https = require('https');
const { URL } = require('url');

let splash;
let mainWindow;
let proxyServer;
let deviceId = null;

// Built-in proxy server with detailed logging
function startProxyServer() {
    return new Promise((resolve) => {
        proxyServer = http.createServer((req, res) => {
            const requestId = Math.random().toString(36).substr(2, 9);
            console.log(`\n🔄 [${requestId}] NEW REQUEST RECEIVED`);
            console.log(`📤 [${requestId}] Method: ${req.method}`);
            console.log(`📤 [${requestId}] URL: ${req.url}`);
            console.log(`📤 [${requestId}] Headers:`, JSON.stringify(req.headers, null, 2));

            // Parse the URL
            let targetUrl;
            if (req.url.startsWith('http')) {
                targetUrl = new URL(req.url);
            } else {
                targetUrl = new URL(req.url, 'https://lms.universityofmonetization.com');
            }

            console.log(`🎯 [${requestId}] Target URL: ${targetUrl.href}`);

            // Only proxy requests to your domain
            if (targetUrl.hostname === 'lms.universityofmonetization.com') {
                console.log(`🚀 [${requestId}] PROXYING REQUEST`);

                // Add required headers
                const headers = {
                    ...req.headers,
                    'Languege': 'en-English',
                    'x-safe-api': deviceId || 'unknown'
                };
                delete headers.host;

                console.log(`📤 [${requestId}] Headers being sent:`, JSON.stringify({
                    'Languege': headers['Languege'],
                    'x-safe-api': headers['x-safe-api'],
                    'User-Agent': headers['user-agent'],
                    'Accept': headers['accept']
                }, null, 2));

                // Forward request
                const proxyReq = https.request({
                    hostname: targetUrl.hostname,
                    port: 443,
                    path: targetUrl.pathname + targetUrl.search,
                    method: req.method,
                    headers: headers
                }, (proxyRes) => {
                    console.log(`📥 [${requestId}] RESPONSE RECEIVED`);
                    console.log(`📥 [${requestId}] Status: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
                    console.log(`📥 [${requestId}] Response Headers:`, JSON.stringify(proxyRes.headers, null, 2));

                    // Log response body size if available
                    const contentLength = proxyRes.headers['content-length'];
                    if (contentLength) {
                        console.log(`📥 [${requestId}] Response Size: ${contentLength} bytes`);
                    }

                    // Forward the response headers
                    res.writeHead(proxyRes.statusCode, proxyRes.headers);

                    // Forward the response body
                    proxyRes.pipe(res);

                    console.log(`✅ [${requestId}] REQUEST COMPLETED SUCCESSFULLY\n`);
                });

                proxyReq.on('error', (error) => {
                    console.error(`❌ [${requestId}] PROXY ERROR:`, error.message);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Proxy Error');
                    console.log(`❌ [${requestId}] REQUEST FAILED\n`);
                });

                // Forward the request body
                req.pipe(proxyReq);

            } else {
                console.log(`❌ [${requestId}] NOT PROXYING - Wrong domain: ${targetUrl.hostname}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found - Only lms.universityofmonetization.com is proxied');
                console.log(`❌ [${requestId}] REQUEST REJECTED\n`);
            }
        });

        const PORT = 8080;
        proxyServer.listen(PORT, () => {
            console.log(`🚀 Built-in proxy running on port ${PORT}`);
            console.log(`📋 All requests to lms.universityofmonetization.com will be proxied with headers`);
            resolve();
        });
    });
}

function createWindow() {
    Menu.setApplicationMenu(null);

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

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            partition: "persist:userSession",
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.obf.js'),
            nodeIntegration: false, // recommended
        },
        // autoHideMenuBar: true,
        maximizable: false,
        minimizable: false,
        resizable: false,
        show: false // Don't show until ready
    });

    // mainWindow.setContentProtection(true);

    // Get device ID first
    getHWID(true).then(id => {
        deviceId = id;
        console.log('Device ID obtained:', deviceId);
    }).catch(error => {
        console.error('Failed to get device ID:', error);
        deviceId = 'unknown';
    });

    // Inject custom header to ALL requests - ENHANCED VERSION
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        // Ensure headers object exists
        if (!details.requestHeaders) {
            details.requestHeaders = {};
        }

        // Set the Languege header (case-sensitive as per .htaccess)
        details.requestHeaders["Languege"] = "en-English";

        // Set device ID (use cached value or fallback)
        details.requestHeaders["x-safe-api"] = deviceId || 'unknown';

        // Log headers for debugging (remove in production)
        console.log('🔧 Headers injected for:', details.url);
        console.log('Headers:', details.requestHeaders);

        callback({ requestHeaders: details.requestHeaders });
    });

    // Handle response errors
    session.defaultSession.webRequest.onErrorOccurred((details, callback) => {
        console.error('Request error:', details.error, 'for URL:', details.url);
        if (details.error === 'net::ERR_ACCESS_DENIED' || details.error === 'net::ERR_FORBIDDEN') {
            console.error('🚫 ACCESS DENIED - Header injection might have failed');
            console.error('Current device ID:', deviceId);
        }
    });

    // Alternative header injection method using webContents
    mainWindow.webContents.on('dom-ready', async () => {
        try {
            const currentDeviceId = deviceId || await getHWID(true);
            await mainWindow.webContents.executeJavaScript(`
                // Override fetch
                const originalFetch = window.fetch;
                window.fetch = function(resource, init = {}) {
                    init.headers = {
                        ...init.headers,
                        'Languege': 'en-English',
                        'x-safe-api': '${currentDeviceId}'
                    };
                    console.log('🔧 Fetch with headers:', init.headers);
                    return originalFetch(resource, init);
                };

                // Override XMLHttpRequest
                const OriginalXHR = window.XMLHttpRequest;
                window.XMLHttpRequest = function() {
                    const xhr = new OriginalXHR();
                    const originalOpen = xhr.open;
                    
                    xhr.open = function(method, url, async, user, password) {
                        originalOpen.call(this, method, url, async, user, password);
                        this.setRequestHeader('Languege', 'en-English');
                        this.setRequestHeader('x-safe-api', '${currentDeviceId}');
                        console.log('🔧 XHR headers set for:', url);
                    };
                    
                    return xhr;
                };
                
                console.log('✅ Header injection script executed successfully');
            `);
        } catch (error) {
            console.error('Failed to inject headers via webContents:', error);
        }
    });

    // CRITICAL: Set up session headers BEFORE loading URL
    console.log('🚀 Setting up session headers...');

    // Load the main URL AFTER setting up headers
    setTimeout(() => {
        console.log('🌐 Loading main URL with headers...');
        // Use proxy instead of direct URL
        mainWindow.loadURL('http://localhost:8080');
    }, 100);

    // Show main window and hide splash when loaded
    mainWindow.webContents.on('did-finish-load', () => {
        if (splash) splash.destroy();
        mainWindow.show();
    });

    // Handle load failure
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription);
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

// Start proxy server first, then create window
app.whenReady().then(async () => {
    await startProxyServer();
    createWindow();
});

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

app.on('before-quit', () => {
    if (proxyServer) {
        proxyServer.close();
        console.log('🔚 Proxy server closed');
    }
});

ipcMain.handle('get-device-id', async () => {
    return await getHWID(true);
});