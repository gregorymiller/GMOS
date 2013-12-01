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
    this.getNextOpenFile = krnGetNextOpenFile;
    this.checkMBR = krnCheckMBR;
    this.incrementMBRValue = krnIncrementMBRValue;
    this.getDirectoryFromFileName = krnGetDirectoryFromFileName;
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
                    value = krnSetValue(0, DEFAULT_TSB, "");

                    localStorage[key] = value;
                }
            }
        }

        // Set the Master Boot Record with the first free file space
        localStorage[MBR] = krnSetValue(1, _MBRLocation, "MBR");

        return true;
    }
    catch(e) {
        hostLog("FORMAT: Unable to format", "OS");
        return false;
    }
}

function krnCreate(fileName) {
    // Do a check in the directory to see if the file name already exists if it does do not create the file
    var directoryCheck = krnGetDirectoryFromFileName(fileName);
    if (directoryCheck != null)
    {
        hostLog("CREATE: Cannot create to files with the same name", "OS");
        return false;
    }

    // Return the next usable directory location
    var directoryLocation = krnGetNextOpenDirectory();

    // Return next usable file location
    var fileLocation = krnCheckMBR();

    if (directoryLocation === null)
    {
        hostLog("CREATE: No open directory locations. Free up space", "OS");
        return false;
    }
    else if(fileLocation === null)
    {
        hostLog("CREATE: No open file locations. Free up space", "OS");
        return false;
    }
    // Make sure the file name does not exceed the byte limit
    else if (fileName.length < 61)
    {
        // Set the file directory and change the file location to occupied
        localStorage[directoryLocation] = krnSetValue(1, fileLocation.replace(/[[\],]/g, ""), fileName.toLowerCase());
        localStorage[fileLocation] = krnSetValue(1, DEFAULT_TSB, "");

        // Increment the MBR track, sector, and block to hopefully have the MBR hold the next open location
        krnIncrementMBRValue();

        // Change the MBR to the incremented track, sector, and block
        localStorage[MBR] = krnSetValue(1, _MBRLocation, "MBR");

        return true;
    }
    else
    {
        return false;
    }
}

function krnWrite(fileName, data) {
    var directoryLocation = krnGetDirectoryFromFileName(fileName);

    if (directoryLocation != null)
    {
        var value = JSON.parse(localStorage[directoryLocation]);

        var track = value[1];
        var sector = value[2];
        var block = value[3];

        var fileLocation = JSON.stringify([track, sector, block]);

        if (data.length < 61)
        {
            localStorage[fileLocation] = krnSetValue(1, DEFAULT_TSB, data.toLowerCase());

            return true;
        }
        else
        {
            var numberOfBlocks = Math.ceil(data.length / 60);

            for (var i = 0; i < numberOfBlocks; i++) {
                var nextBlock = krnGetNextOpenFile();

                var tempData = data.substring((i * 60), ((i + 1) * 60));

                if (i === numberOfBlocks - 1)
                {
                    localStorage[fileLocation] = krnSetValue(1, DEFAULT_TSB, tempData.toLowerCase());
                }
                else
                {
                    localStorage[fileLocation] = krnSetValue(1, nextBlock.replace(/[[\],]/g, ""), tempData.toLowerCase());
                }

                fileLocation = nextBlock;
            }

            return true;
        }
    }
    else
    {
        hostLog("WRITE: Directory not found", "OS");
        return false;
    }
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
        if (keyValue > 0 && keyValue < 78)
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

    // If no key is found
    return null;
}

function krnSetValue (occupied, key, value) {
    // Get the track, sector, and block from the MBR
    var track = parseInt(key[0]);
    var sector = parseInt(key[1]);
    var block = parseInt(key[2]);

    return JSON.stringify([occupied, track, sector, block, krnFillFreeSpace(value)]);
}

function krnGetNextOpenFile() {
    // Look through all the keys in local storage
    for (var i in localStorage) {
        // Get the key value as all numbers then parse it into an integer
        var keyValue = i.replace(/[[\],]/g, "");
        keyValue = parseInt(keyValue);

        // Check to make sure that the key is in directory space
        if (keyValue > 99 && keyValue < 378)
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

    // If no key is found
    return null;
}

function krnCheckMBR () {
    // Get the track, sector, and block from the master boot record
    var track = _MBRLocation[0];
    var sector = _MBRLocation[1];
    var block = _MBRLocation[2];

    // Get the file location key and the value at that location
    var fileLocation = JSON.stringify([track, sector, block]);
    var fileValue = JSON.parse(localStorage[fileLocation]);

    // Get the occupied bit
    var occupied = fileValue[0];

    // If it is not occupied return the master boot record otherwise search for an open space
    if (occupied === 0)
    {
        return fileLocation;
    }
    else
    {
        return krnGetNextOpenFile();
    }
}

function krnIncrementMBRValue() {
    _MBRLocation[2]++;

    if (_MBRLocation[2] > 7)
    {
        _MBRLocation[2] = 0
        _MBRLocation[1]++;
    }
    else if (_MBRLocation[1] > 7)
    {
        _MBRLocation[1] = 0;
        _MBRLocation[0]++;
    }
    else if (_MBRLocation[0] > 3)
    {
        _MBRLocation[0] = 1;
        _MBRLocation[1] = 0;
        _MBRLocation[2] = 0;
    }
}

function krnGetDirectoryFromFileName(fileName) {
    // Look through all the keys in local storage
    for (var i in localStorage) {
        // Get the key value as all numbers then parse it into an integer
        var keyValue = i.replace(/[[\],]/g, "");
        keyValue = parseInt(keyValue);

        // Check to make sure that the key is in directory space
        if (keyValue > 0 && keyValue < 78)
        {
            // Get the first bit to check if it is occupied or not
            var value = JSON.parse(localStorage[i]);
            var occupied = value[0];
            var fileNameData = value[4].replace(/~/g, "");

            // If it is not occupied return that directory location
            if (occupied === 1)
            {
                if (fileNameData === fileName)
                {
                    return i;
                }
            }
        }
    }

    // If no key is found
    return null;
}