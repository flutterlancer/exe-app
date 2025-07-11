const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

const files = ['preload.js'];
files.forEach(file => {
    const sourceCode = fs.readFileSync(file, 'utf8');
    const obfuscated = JavaScriptObfuscator.obfuscate(sourceCode, {
        compact: true,
        controlFlowFlattening: true,
        deadCodeInjection: true,
        rotateStringArray: true,
        stringArrayThreshold: 0.75,
    });
    fs.writeFileSync(file.replace('.js', '.obf.js'), obfuscated.getObfuscatedCode());
});