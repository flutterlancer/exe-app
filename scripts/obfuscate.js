const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');
const crypto = require('crypto');

// SECRET KEY - Must be provided via environment variable
const SECRET_KEY = process.env.OBFUSCATION_SECRET;

if (!SECRET_KEY) {
    console.error('❌ ERROR: OBFUSCATION_SECRET environment variable is required!');
    console.error('💡 Please set it in your package.json scripts or as an environment variable.');
    console.error('🔑 Example: cross-env OBFUSCATION_SECRET="your_secret_key" node scripts/obfuscate.js');
    process.exit(1);
}

// Generate a unique salt for this obfuscation session
const SESSION_SALT = crypto.randomBytes(16).toString('hex');

console.log('🔐 Starting MAXIMUM SECURITY obfuscation...');
console.log(`🔑 Using secret key: ${SECRET_KEY.substring(0, 10)}...`);
console.log(`🧂 Session salt: ${SESSION_SALT}`);

const files = ["main.js", 'preload.js'];

files.forEach(file => {
    console.log(`\n🔄 Processing: ${file}`);

    const sourceCode = fs.readFileSync(file, 'utf8');

    // Add secret key validation at the beginning of each file
    const secretValidation = `
        (function(){
            const _0x${SESSION_SALT.substring(0, 8)} = '${SECRET_KEY}';
            const _0x${SESSION_SALT.substring(8, 16)} = '${SESSION_SALT}';
            if (typeof _0x${SESSION_SALT.substring(0, 8)} === 'undefined' || _0x${SESSION_SALT.substring(0, 8)} !== '${SECRET_KEY}') {
                throw new Error('Security validation failed');
            }
        })();
    `;

    const codeWithSecret = secretValidation + sourceCode;

    // MAXIMUM SECURITY obfuscation settings
    const obfuscated = JavaScriptObfuscator.obfuscate(codeWithSecret, {
        // COMPACTNESS - Make it unreadable
        compact: true,

        // CONTROL FLOW - Make it extremely hard to follow
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,

        // DEAD CODE - Add fake code to confuse reverse engineers
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 1,

        // DEBUG PROTECTION - Prevent debugging
        debugProtection: true,
        debugProtectionInterval: 4000,

        // CONSOLE OUTPUT - Remove all console logs
        disableConsoleOutput: true,

        // IDENTIFIER NAMES - Make them completely random
        identifierNamesGenerator: 'hexadecimal',

        // LOGGING - Disable obfuscator logs
        log: false,

        // NUMBERS - Convert to expressions
        numbersToExpressions: true,

        // GLOBAL RENAMING - Rename everything possible (disabled for Electron compatibility)
        renameGlobals: false,

        // STRING ARRAYS - Encrypt all strings
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 1,
        rotateStringArray: true,
        shuffleStringArray: true,

        // STRING SPLITTING - Break strings into pieces
        splitStrings: true,
        splitStringsChunkLength: 3,

        // UNICODE ESCAPES - Make strings unreadable
        unicodeEscapeSequence: true,

        // OBJECT KEYS - Transform object property names (disabled for compatibility)
        transformObjectKeys: false,

        // SELF DEFENDING - Add anti-tampering
        selfDefending: true,

        // RESERVED NAMES - Only preserve absolutely critical names
        // reservedNames: [
        //     'require', 'module', 'exports', '__dirname', '__filename',
        //     'process', 'global', 'Buffer', 'console', 'setTimeout',
        //     'setInterval', 'clearTimeout', 'clearInterval', 'setImmediate',
        //     'clearImmediate', 'requestAnimationFrame', 'cancelAnimationFrame',
        //     'ipcRenderer', 'ipcMain', 'contextBridge', 'webContents',
        //     'BrowserWindow', 'app', 'session', 'webRequest', 'onBeforeSendHeaders',
        //     'requestHeaders', 'callback', 'invoke', 'send', 'on', 'handle'
        // ],

        // // RESERVED STRINGS - Only preserve critical strings
        // reservedStrings: [
        //     'language', 'x-safe-api', 'en-English', 'get-device-id',
        //     'https://lms.universityofmonetization.com',
        //     'persist:userSession'
        // ],

        // DOMAIN LOCK - Lock to specific domains (optional)
        // domainLock: ['lms.universityofmonetization.com'],

        // SOURCE MAP - Disable for security
        sourceMap: false,
        sourceMapMode: 'separate',

        // TARGET - Modern browsers
        target: 'browser',

        // SEED - Use secret key as seed for consistent obfuscation
        seed: crypto.createHash('md5').update(SECRET_KEY + SESSION_SALT).digest('hex').substring(0, 8)
    });

    const outputFile = file.replace('.js', '.obf.js');
    fs.writeFileSync(outputFile, obfuscated.getObfuscatedCode());

    // Add file integrity check
    const fileHash = crypto.createHash('sha256').update(obfuscated.getObfuscatedCode()).digest('hex');
    console.log(`✅ Obfuscated ${file} -> ${outputFile}`);
    console.log(`🔒 File integrity hash: ${fileHash}`);
    console.log(`📊 Original size: ${sourceCode.length} bytes`);
    console.log(`📊 Obfuscated size: ${obfuscated.getObfuscatedCode().length} bytes`);
    console.log(`📈 Obfuscation ratio: ${((obfuscated.getObfuscatedCode().length / sourceCode.length) * 100).toFixed(1)}%`);
});

console.log('\n🎯 MAXIMUM SECURITY OBFUSCATION COMPLETE!');
console.log('⚠️  WARNING: This code is now extremely difficult to reverse engineer');
console.log('🔐 Secret key validation is embedded in each file');
console.log('🚫 Debugging and console output are disabled');
console.log('🛡️  Anti-tampering protection is active');