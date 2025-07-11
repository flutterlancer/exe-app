const { machineId, machineIdSync } = require('node-machine-id');

(async () => {
    // async, hashed if you pass 'true'
    const id1 = await machineId();          // original 32-char hex
    const id2 = await machineId(true);      // SHA-256 hashed string

    // sync version
    const id3 = machineIdSync();            // same as id1
    console.log(id1, "\n", id2, "\n", id3);
})()