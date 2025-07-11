const { ipcRenderer, contextBridge } = require('electron');

// Patch fetch to add custom headers
const originalFetch = window.fetch;
window.fetch = async function (resource, init = {}) {
    const deviceId = await ipcRenderer.invoke('get-device-id');
    init.headers = {
        ...init.headers,
        'language': 'en-English',
        'x-safe-api': deviceId
    };
    return originalFetch(resource, init);
};
// And similarly for XHR

// Patch XMLHttpRequest to add custom headers
const OriginalXHR = window.XMLHttpRequest;
function CustomXHR() {
    const xhr = new OriginalXHR();
    const open = xhr.open;
    xhr.open = function (method, url, async, user, password) {
        open.call(this, method, url, async, user, password);
        this.setRequestHeader('language', 'en-English');
        this.setRequestHeader('x-safe-api', 'YOUR_DEVICE_ID');
    };
    return xhr;
}
window.XMLHttpRequest = CustomXHR;

// Existing splash logic
window.addEventListener('DOMContentLoaded', () => {
    window.requestAnimationFrame(() => {
        ipcRenderer.send('main-ready');
    });
});