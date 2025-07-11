const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
    packagerConfig: {
        asar: true,
        icon: './assets/icons/win/icon.ico',
        osxSign: false,
        extraResource: ['./splash.html'],
        ignore: ['^/src/[^/]+\\.js$'], // Ignore .js files in src/ (e.g., main.js, preload.js)
    },
    rebuildConfig: {
        arch: 'x64',
    },
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: 'uom-lms',
                setupIcon: './assets/icons/win/icon.ico',
            },
        },
    ],
    plugins: [
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};