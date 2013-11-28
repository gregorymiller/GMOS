/* ----------------------------------
 DeviceDriverFileSystem.js

 Requires deviceDriver.js

 The Kernel File System Device Driver.
 ---------------------------------- */

DeviceDriverKeyboard.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

function DeviceDriverFileSystem()
{
    // Override the base method pointers.
    this.driverEntry = krnFileSystemDriverEntry;
    this.isr = null;

    this.create = krnCreate;
    this.read	= krnRead;
    this.write	= krnWrite;
    this.format = krnFormat;
    this.delete = krnDelete;
    this.listFiles = krnListFiles;
}

function krnFileSystemDriverEntry() {
    // Initialization routine for this, the kernel-mode Keyboard Device Driver.
    this.status = "loaded";
    // More?
}

function krnFormat() {
    try {
        // Clear storage before use
        localStorage.clear();

        var key = "";
        var value = "";

        // Track
        for (var t = 0; t < 4; t++) {
            // Sector
            for (var s = 0; s < 8; s++) {
                // Block
                for (var b = 0; b < 8; b++) {
                    key = JSON.stringify([t, s, b]);
                    value = JSON.stringify([0, -1, -1, -1, ""]);

                    localStorage[key] = value;
                }
            }
        }
    }
    catch(e) {

    }
}

function krnCreate() {

}

function krnWrite() {

}

function krnRead() {

}

function krnDelete() {

}

function krnListFiles() {

}