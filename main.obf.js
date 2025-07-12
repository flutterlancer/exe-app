const {app, BrowserWindow, Menu, systemPreferences, ipcMain, session} = require('electron'), path = require('path'), {machineId: getHWID} = require('node-machine-id'), http = require('http'), https = require('https'), {URL} = require('url');
let splash, mainWindow, proxyServer, deviceId = null;
function startProxyServer() {
    return new Promise(_0x23ef96 => {
        proxyServer = http['createServer']((_0x144748, _0x41e135) => {
            const _0x11e362 = Math['random']()['toString'](0x24)['substr'](0x2, 0x9);
            console['log']('\x0a🔄\x20[' + _0x11e362 + ']\x20NEW\x20REQUEST\x20RECEIVED'), console['log']('📤\x20[' + _0x11e362 + ']\x20Method:\x20' + _0x144748['method']), console['log']('📤\x20[' + _0x11e362 + ']\x20URL:\x20' + _0x144748['url']), console['log']('📤\x20[' + _0x11e362 + ']\x20Headers:', JSON['stringify'](_0x144748['headers'], null, 0x2));
            let _0x4ce019;
            _0x144748['url']['startsWith']('http') ? _0x4ce019 = new URL(_0x144748['url']) : _0x4ce019 = new URL(_0x144748['url'], 'https://lms.universityofmonetization.com');
            console['log']('🎯\x20[' + _0x11e362 + ']\x20Target\x20URL:\x20' + _0x4ce019['href']);
            if (_0x4ce019['hostname'] === 'lms.universityofmonetization.com') {
                console['log']('🚀\x20[' + _0x11e362 + ']\x20PROXYING\x20REQUEST');
                const _0x2a2efa = {
                    ..._0x144748['headers'],
                    'Languege': 'en-English',
                    'x-safe-api': deviceId || 'unknown'
                };
                delete _0x2a2efa['host'], console['log']('📤\x20[' + _0x11e362 + ']\x20Headers\x20being\x20sent:', JSON['stringify']({
                    'Languege': _0x2a2efa['Languege'],
                    'x-safe-api': _0x2a2efa['x-safe-api'],
                    'User-Agent': _0x2a2efa['user-agent'],
                    'Accept': _0x2a2efa['accept']
                }, null, 0x2));
                const _0x1ee1b5 = https['request']({
                    'hostname': _0x4ce019['hostname'],
                    'port': 0x1bb,
                    'path': _0x4ce019['pathname'] + _0x4ce019['search'],
                    'method': _0x144748['method'],
                    'headers': _0x2a2efa
                }, _0x6f491 => {
                    console['log']('📥\x20[' + _0x11e362 + ']\x20RESPONSE\x20RECEIVED'), console['log']('📥\x20[' + _0x11e362 + ']\x20Status:\x20' + _0x6f491['statusCode'] + '\x20' + _0x6f491['statusMessage']), console['log']('📥\x20[' + _0x11e362 + ']\x20Response\x20Headers:', JSON['stringify'](_0x6f491['headers'], null, 0x2));
                    const _0x4cc343 = _0x6f491['headers']['content-length'];
                    _0x4cc343 && console['log']('📥\x20[' + _0x11e362 + ']\x20Response\x20Size:\x20' + _0x4cc343 + '\x20bytes'), _0x41e135['writeHead'](_0x6f491['statusCode'], _0x6f491['headers']), _0x6f491['pipe'](_0x41e135), console['log']('✅\x20[' + _0x11e362 + ']\x20REQUEST\x20COMPLETED\x20SUCCESSFULLY\x0a');
                });
                _0x1ee1b5['on']('error', _0x1709a9 => {
                    console['error']('❌\x20[' + _0x11e362 + ']\x20PROXY\x20ERROR:', _0x1709a9['message']), _0x41e135['writeHead'](0x1f4, { 'Content-Type': 'text/plain' }), _0x41e135['end']('Proxy\x20Error'), console['log']('❌\x20[' + _0x11e362 + ']\x20REQUEST\x20FAILED\x0a');
                }), _0x144748['pipe'](_0x1ee1b5);
            } else
                console['log']('❌\x20[' + _0x11e362 + ']\x20NOT\x20PROXYING\x20-\x20Wrong\x20domain:\x20' + _0x4ce019['hostname']), _0x41e135['writeHead'](0x194, { 'Content-Type': 'text/plain' }), _0x41e135['end']('Not\x20Found\x20-\x20Only\x20lms.universityofmonetization.com\x20is\x20proxied'), console['log']('❌\x20[' + _0x11e362 + ']\x20REQUEST\x20REJECTED\x0a');
        });
        const _0x57fb5d = 0x1f90;
        proxyServer['listen'](_0x57fb5d, () => {
            console['log']('🚀\x20Built-in\x20proxy\x20running\x20on\x20port\x20' + _0x57fb5d), console['log']('📋\x20All\x20requests\x20to\x20lms.universityofmonetization.com\x20will\x20be\x20proxied\x20with\x20headers'), _0x23ef96();
        });
    });
}
function createWindow() {
    Menu['setApplicationMenu'](null);
    const _0x5d7993 = require('os');
    (_0x5d7993['hostname']()['toLowerCase']()['includes']('vmware') || _0x5d7993['cpus']()[0x0]['model']['includes']('Virtual')) && app['quit'](), splash = new BrowserWindow({
        'width': 0x12c,
        'height': 0x12c,
        'transparent': !![],
        'frame': ![],
        'alwaysOnTop': !![],
        'skipTaskbar': !![],
        'webPreferences': {
            'nodeIntegration': !![],
            'contextIsolation': ![]
        }
    }), splash['loadFile'](path['join'](__dirname, 'splash.html')), mainWindow = new BrowserWindow({
        'width': 0x500,
        'height': 0x320,
        'webPreferences': {
            'partition': 'persist:userSession',
            'contextIsolation': !![],
            'preload': path['join'](__dirname, 'preload.obf.js'),
            'nodeIntegration': ![]
        },
        'maximizable': ![],
        'minimizable': ![],
        'resizable': ![],
        'show': ![]
    }), getHWID(!![])['then'](_0x57d83f => {
        deviceId = _0x57d83f, console['log']('Device\x20ID\x20obtained:', deviceId);
    })['catch'](_0x53d1c9 => {
        console['error']('Failed\x20to\x20get\x20device\x20ID:', _0x53d1c9), deviceId = 'unknown';
    }), session['defaultSession']['webRequest']['onBeforeSendHeaders']((_0x35c14b, _0x235f41) => {
        !_0x35c14b['requestHeaders'] && (_0x35c14b['requestHeaders'] = {}), _0x35c14b['requestHeaders']['Languege'] = 'en-English', _0x35c14b['requestHeaders']['x-safe-api'] = deviceId || 'unknown', console['log']('🔧\x20Headers\x20injected\x20for:', _0x35c14b['url']), console['log']('Headers:', _0x35c14b['requestHeaders']), _0x235f41({ 'requestHeaders': _0x35c14b['requestHeaders'] });
    }), session['defaultSession']['webRequest']['onErrorOccurred']((_0x1415f7, _0x2d1b55) => {
        console['error']('Request\x20error:', _0x1415f7['error'], 'for\x20URL:', _0x1415f7['url']), (_0x1415f7['error'] === 'net::ERR_ACCESS_DENIED' || _0x1415f7['error'] === 'net::ERR_FORBIDDEN') && (console['error']('🚫\x20ACCESS\x20DENIED\x20-\x20Header\x20injection\x20might\x20have\x20failed'), console['error']('Current\x20device\x20ID:', deviceId));
    }), mainWindow['webContents']['on']('dom-ready', async () => {
        try {
            const _0x26b323 = deviceId || await getHWID(!![]);
            await mainWindow['webContents']['executeJavaScript']('\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20//\x20Override\x20fetch\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20const\x20originalFetch\x20=\x20window.fetch;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20window.fetch\x20=\x20function(resource,\x20init\x20=\x20{})\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20init.headers\x20=\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20...init.headers,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x27Languege\x27:\x20\x27en-English\x27,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x27x-safe-api\x27:\x20\x27' + _0x26b323 + '\x27\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20};\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20console.log(\x27🔧\x20Fetch\x20with\x20headers:\x27,\x20init.headers);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20return\x20originalFetch(resource,\x20init);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20};\x0a\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20//\x20Override\x20XMLHttpRequest\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20const\x20OriginalXHR\x20=\x20window.XMLHttpRequest;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20window.XMLHttpRequest\x20=\x20function()\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20const\x20xhr\x20=\x20new\x20OriginalXHR();\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20const\x20originalOpen\x20=\x20xhr.open;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20xhr.open\x20=\x20function(method,\x20url,\x20async,\x20user,\x20password)\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20originalOpen.call(this,\x20method,\x20url,\x20async,\x20user,\x20password);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20this.setRequestHeader(\x27Languege\x27,\x20\x27en-English\x27);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20this.setRequestHeader(\x27x-safe-api\x27,\x20\x27' + _0x26b323 + '\x27);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20console.log(\x27🔧\x20XHR\x20headers\x20set\x20for:\x27,\x20url);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20};\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20return\x20xhr;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20};\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20console.log(\x27✅\x20Header\x20injection\x20script\x20executed\x20successfully\x27);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20');
        } catch (_0x58a6ff) {
            console['error']('Failed to inject headers via webContents:', _0x58a6ff);
        }
    }), console['log']('\uD83D\uDE80 Setting up session headers...'), setTimeout(() => {
        console['log']('🌐\x20Loading\x20main\x20URL\x20with\x20headers...'), mainWindow['loadURL']('http://localhost:8080');
    }, 0x64), mainWindow['webContents']['on']('did-finish-load', () => {
        if (splash)
            splash['destroy']();
        mainWindow['show']();
    }), mainWindow['webContents']['on']('did-fail-load', (_0x5f5209, _0x379bb3, _0x4f2201) => {
        console['error']('Failed\x20to\x20load:', _0x379bb3, _0x4f2201), splash && splash['webContents']['send']('show-error', 'Failed\x20to\x20load\x20website:\x20' + _0x4f2201 + '\x20(' + _0x379bb3 + ')');
    }), mainWindow['addEventListener']('contextmenu', _0x2c7725 => {
        _0x2c7725['preventDefault']();
    }), mainWindow['addEventListener']('keydown', function (_0x4fcd21) {
        (_0x4fcd21['ctrlKey'] && _0x4fcd21['shiftKey'] && _0x4fcd21['key'] === 'I' || _0x4fcd21['ctrlKey'] && _0x4fcd21['shiftKey'] && _0x4fcd21['key'] === 'C' || _0x4fcd21['ctrlKey'] && _0x4fcd21['shiftKey'] && _0x4fcd21['key'] === 'J' || _0x4fcd21['ctrlKey'] && _0x4fcd21['key'] === 'U' || _0x4fcd21['key'] === 'F12') && _0x4fcd21['preventDefault']();
    }), mainWindow['webContents']['on']('before-input-event', (_0x4452fe, _0x26fd52) => {
        (_0x26fd52['control'] && _0x26fd52['shift'] && (_0x26fd52['key']['toLowerCase']() === 'i' || _0x26fd52['key']['toLowerCase']() === 'c' || _0x26fd52['key']['toLowerCase']() === 'j') || _0x26fd52['key'] === 'F12') && _0x4452fe['preventDefault']();
    }), mainWindow['webContents']['on']('devtools-opened', () => {
        mainWindow['webContents']['closeDevTools']();
    });
}
ipcMain['on']('main-ready', () => {
});
if (process['platform'] === 'darwin') {
    const subId = systemPreferences['subscribeNotification']('com.apple.screenIsBeingCapturedDidChange', (_0x2d5f93, _0x2ad145) => {
        systemPreferences['getMediaAccessStatus']('screen') === 'granted' && (console['log']('Screen\x20is\x20being\x20captured!'), mainWindow['hide']());
    });
    app['on']('will-quit', () => systemPreferences['unsubscribeNotification'](subId));
}
app['whenReady']()['then'](async () => {
    await startProxyServer(), createWindow();
}), app['on']('window-all-closed', () => {
    process['platform'] !== 'darwin' && app['quit']();
}), app['on']('activate', () => {
    BrowserWindow['getAllWindows']()['length'] === 0x0 && createWindow();
}), app['on']('before-quit', () => {
    proxyServer && (proxyServer['close'](), console['log']('🔚\x20Proxy\x20server\x20closed'));
}), ipcMain['handle']('get-device-id', async () => {
    return await getHWID(!![]);
});