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

    this.fillFreeSpace = krnFillFreeSpace;
    this.getNextOpenDirectory = krnGetNextOpenDirectory;
    this.setValue = krnSetValue;
}

function krnFileSystemDriverEntry() {
    // Initialization routine for this, the kernel-mode File System Device Driver.
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
        for (var t = 0; t < TRACK_SIZE; t++) {
            // Sector
            for (var s = 0; s < SECTOR_SIZE; s++) {
                // Block
                for (var b = 0; b < BLOCK_SIZE; b++) {
                    key = JSON.stringify([t, s, b]);
                    value = JSON.stringify([0, -1, -1, -1, krnFillFreeSpace("")]);

                    localStorage[key] = value;
                }
            }
        }

        // Set the Master Boot Record with the first free file space
        localStorage[MBR] = JSON.stringify([1, 1, 0, 0, krnFillFreeSpace("MBR")]);

        return true;
    }
    catch(e) {
        return false;
    }
}

function krnCreate(fileName) {
    // Retrieve the MBR for the next usable file location
    var MBRValue = JSON.parse(localStorage[MBR]);

    // Return the next usable directory location
    var directoryLocation = krnGetNextOpenDirectory();

    // Make sure the file name does not exceed the byte limit
    if (fileName.length < 60)
    {
        localStorage[directoryLocation] = krnSetValue(1, MBRValue, fileName);
    }
}

function krnWrite() {

}

function krnRead() {

}

function krnDelete() {

}

function krnListFiles() {

}

// Add tildes to the end of data both for display and as end of file markers
function krnFillFreeSpace(data) {
    for (var i = data.length; i < 60; i++) {
        data += "~";
    }

    return data;
}

function krnGetNextOpenDirectory() {
    // Look through all the keys in local storage
    for (var i in localStorage) {
        // Get the key value as all numbers then parse it into an integer
        var keyValue = i.replace(/[[\],]/g, "");
        keyValue = parseInt(keyValue);

        // Check to make sure that the key is in directory space
        if (keyValue > 0 && keyValue < 77)
        {
            // Get the first bit to check if it is occupied or not
            var value = JSON.parse(localStorage[i]);
            var occupied = value[0];

            // If it is not occupied return that directory location
            if (occupied === 0)
            {
                return i;
            }
        }
    }
}

function krnSetValue (occupied, key, value) {
    var track = key[1];
    var sector = key[2];
    var block = key[3];

    return JSON.stringify([occupied, track, sector, block, krnFillFreeSpace(value)]);
}