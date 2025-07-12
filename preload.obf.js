const {ipcRenderer, contextBridge} = require('electron'), originalFetch = window['fetch'];
window['fetch'] = async function (_0x12745e, _0x2e2b2b = {}) {
    try {
        const _0x35ed53 = await ipcRenderer['invoke']('get-device-id');
        _0x2e2b2b['headers'] = {
            ..._0x2e2b2b['headers'],
            'Languege': 'en-English',
            'x-safe-api': _0x35ed53
        }, console['log']('Fetch\x20request\x20with\x20headers:', _0x2e2b2b['headers']);
    } catch (_0x1571f2) {
        console['error']('Failed to get device ID for fetch:', _0x1571f2), _0x2e2b2b['headers'] = {
            ..._0x2e2b2b['headers'],
            'Languege': 'en-English',
            'x-safe-api': 'unknown'
        };
    }
    return originalFetch(_0x12745e, _0x2e2b2b);
};
const OriginalXHR = window['XMLHttpRequest'];
function CustomXHR() {
    const _0x24d7c6 = new OriginalXHR(), open = _0x24d7c6['open'], setRequestHeader = _0x24d7c6['setRequestHeader'];
    return _0x24d7c6['open'] = function (_0x55c50b, _0x316224, _0x4eae04, _0x5d87a6, _0x1401ac) {
        open['call'](this, _0x55c50b, _0x316224, _0x4eae04, _0x5d87a6, _0x1401ac), this['addEventListener']('readystatechange', async function () {
            if (this['readyState'] === 0x1)
                try {
                    const _0x47264a = await ipcRenderer['invoke']('get-device-id');
                    setRequestHeader['call'](this, 'Languege', 'en-English'), setRequestHeader['call'](this, 'x-safe-api', _0x47264a), console['log']('XHR\x20headers\x20set:', {
                        'Languege': 'en-English',
                        'x-safe-api': _0x47264a
                    });
                } catch (_0x949579) {
                    console['error']('Failed\x20to\x20get\x20device\x20ID\x20for\x20XHR:', _0x949579), setRequestHeader['call'](this, 'Languege', 'en-English'), setRequestHeader['call'](this, 'x-safe-api', 'unknown');
                }
        });
    }, _0x24d7c6;
}
window['XMLHttpRequest'] = CustomXHR, window['addEventListener']('DOMContentLoaded', () => {
    window['requestAnimationFrame'](() => {
        ipcRenderer['send']('main-ready');
    });
});