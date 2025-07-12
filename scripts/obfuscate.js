const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

const files = ["main.js", 'preload.js'];
files.forEach(file => {
    const sourceCode = fs.readFileSync(file, 'utf8');

    // Use very conservative obfuscation settings
    const obfuscated = JavaScriptObfuscator.obfuscate(sourceCode, {
        compact: false, // Keep readable
        controlFlowFlattening: false, // Disable - breaks functionality
        deadCodeInjection: false, // Disable - breaks functionality
        debugProtection: false, // Disable - can cause issues
        disableConsoleOutput: false, // Keep console logs for debugging
        identifierNamesGenerator: 'hexadecimal', // Use hex names
        log: false, // Disable obfuscator logs
        numbersToExpressions: false, // Disable - can break numbers
        renameGlobals: false, // Disable - breaks module system
        rotateStringArray: false, // Disable - can break strings
        selfDefending: false, // Disable - can cause issues
        shuffleStringArray: false, // Disable - can break strings
        splitStrings: false, // Disable - can break strings
        stringArray: false, // Disable - can break strings
        stringArrayEncoding: [], // Disable encoding
        stringArrayThreshold: 0, // Disable threshold
        transformObjectKeys: false, // Disable - breaks object properties
        unicodeEscapeSequence: false, // Disable - can break strings

        // Preserve critical names and strings
        reservedNames: [
            'Languege', 'x-safe-api', 'en-English', 'get-device-id',
            'onBeforeSendHeaders', 'webRequest', 'defaultSession',
            'requestHeaders', 'ipcRenderer', 'invoke', 'fetch',
            'XMLHttpRequest', 'setRequestHeader', 'open', 'send',
            'executeJavaScript', 'dom-ready', 'webContents',
            'machineId', 'getHWID', 'session', 'BrowserWindow',
            'app', 'whenReady', 'createWindow', 'loadURL'
        ],
        reservedStrings: [
            'Languege', 'x-safe-api', 'en-English', 'get-device-id',
            'onBeforeSendHeaders', 'webRequest', 'defaultSession',
            'requestHeaders', 'ipcRenderer', 'invoke', 'fetch',
            'XMLHttpRequest', 'setRequestHeader', 'open', 'send',
            'executeJavaScript', 'dom-ready', 'webContents',
            'machineId', 'getHWID', 'session', 'BrowserWindow',
            'app', 'whenReady', 'createWindow', 'loadURL',
            'https://lms.universityofmonetization.com'
        ]
    });

    fs.writeFileSync(file.replace('.js', '.obf.js'), obfuscated.getObfuscatedCode());
    console.log(`✅ Obfuscated ${file} -> ${file.replace('.js', '.obf.js')} (conservative mode)`);
});