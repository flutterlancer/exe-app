const { ipcRenderer, contextBridge } = require('electron');

// Patch fetch to add custom headers
const originalFetch = window.fetch;
window.fetch = async function (resource, init = {}) {
    try {
        const deviceId = await ipcRenderer.invoke('get-device-id');
        init.headers = {
            ...init.headers,
            'Languege': 'en-English',
            'x-safe-api': deviceId
        };
        console.log('Fetch request with headers:', init.headers);
    } catch (error) {
        console.error('Failed to get device ID for fetch:', error);
        init.headers = {
            ...init.headers,
            'Languege': 'en-English',
            'x-safe-api': 'unknown'
        };
    }
    return originalFetch(resource, init);
};

// Patch XMLHttpRequest to add custom headers
const OriginalXHR = window.XMLHttpRequest;
function CustomXHR() {
    const xhr = new OriginalXHR();
    const open = xhr.open;
    const setRequestHeader = xhr.setRequestHeader;

    xhr.open = function (method, url, async, user, password) {
        open.call(this, method, url, async, user, password);

        // Set headers after open but before send
        this.addEventListener('readystatechange', async function () {
            if (this.readyState === 1) { // OPENED
                try {
                    const deviceId = await ipcRenderer.invoke('get-device-id');
                    setRequestHeader.call(this, 'Languege', 'en-English');
                    setRequestHeader.call(this, 'x-safe-api', deviceId);
                    console.log('XHR headers set:', { 'Languege': 'en-English', 'x-safe-api': deviceId });
                } catch (error) {
                    console.error('Failed to get device ID for XHR:', error);
                    setRequestHeader.call(this, 'Languege', 'en-English');
                    setRequestHeader.call(this, 'x-safe-api', 'unknown');
                }
            }
        });
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