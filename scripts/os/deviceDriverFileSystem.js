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
    this.deleteAllLinkedBlocks = krnDeleteAllLinkedBlocks;
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
    // Put the file name to lower case and trim any possible spaces
    fileName = fileName.toLowerCase().trim();

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
    else if (fileName.length < MAX_DATA)
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
    // Put the file name to lower case and trim any possible spaces
    fileName = fileName.toLowerCase().trim();

    // Get the directory location
    var directoryLocation = krnGetDirectoryFromFileName(fileName);

    // If the location exists then write to it else log an error
    if (directoryLocation != null)
    {
        // Delete all previously linked blocks since write is overwrite and we do not want
        // to leave any left over children that can't be deleted
        krnDeleteAllLinkedBlocks(fileName);

        // Get the track, sector, and block of the file location
        var value = JSON.parse(localStorage[directoryLocation]);

        var track = value[1];
        var sector = value[2];
        var block = value[3];

        var fileLocation = JSON.stringify([track, sector, block]);

        // If the data is less than 60 bytes only allocate one block
        if (data.length < MAX_DATA)
        {
            localStorage[fileLocation] = krnSetValue(1, DEFAULT_TSB, data.toLowerCase().trim());

            return true;
        }
        else
        {
            // Determine the number of blocks needed
            var numberOfBlocks = Math.ceil(data.length / 60);

            // Store the data in each block
            for (var i = 0; i < numberOfBlocks; i++) {
                // Get the next block for reference in the current file block
                var nextBlock = krnGetNextOpenFile();

                // Get the data
                var tempData = data.substring((i * (MAX_DATA - 1)), ((i + 1) * (MAX_DATA - 1)));

                // If it is the last block don't give it another file to point to otherwise add the next block
                if (i === numberOfBlocks - 1)
                {
                    localStorage[fileLocation] = krnSetValue(1, DEFAULT_TSB, tempData.toLowerCase().trim());
                }
                else
                {
                    localStorage[fileLocation] = krnSetValue(1, nextBlock.replace(/[[\],]/g, ""), tempData.toLowerCase().trim());
                }

                // Set the next block as the current file location
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

function krnRead(fileName) {
    // Put the file name to lower case and trim any possible spaces
    fileName = fileName.toLowerCase().trim();

    // Get the directory data from the file name
    var directoryLocation = krnGetDirectoryFromFileName(fileName);

    // If the file exists read the data otherwise log an error
    if (directoryLocation != null)
    {
        // Get the data from the directory
        var value = JSON.parse(localStorage[directoryLocation]);

        // Get the track, sector, and block of the file location
        var track = value[1];
        var sector = value[2];
        var block = value[3];

        var fileLocation = JSON.stringify([track, sector, block]);

        // Create an array to keep track of all the possible blocks
        // Add the first block to the array and set it as the beginning key
        var fileDataList = [fileLocation];
        var key = fileLocation;

        // While there are still blocks in the chain keep adding them
        while (key != "[-1,-1,-1]") {
            // Get the track, sector, and block from the file
            var fileValue = JSON.parse(localStorage[key]);
            var nextFileTrack = fileValue[1];
            var nextFileSector = fileValue[2];
            var nextFileBlock = fileValue[3];

            // Get the next block in the chain
            var nextFile = JSON.stringify([nextFileTrack, nextFileSector, nextFileBlock]);

            // If there is a reference to another file add it to file data
            if (nextFile != "[-1,-1,-1]")
            {
                fileDataList.push(nextFile);
            }

            // Make the key the next file
            key = nextFile;
        }

        var data = "";

        // Go through the file list and add the data to be returned
        for (var i = 0; i < fileDataList.length; i++) {
            // Get the data from the file
            var tempValue = JSON.parse(localStorage[fileDataList[i]]);
            var tempData = tempValue[4];

            // Replace all tildes with empty space so they won't be printed
            data += tempData.replace(/~/g, "");
        }

        return data;
    }
    else
    {
        hostLog("READ: Directory not found", "OS");
        return null;
    }
}

function krnDelete(fileName) {
    // Put the file name to lower case and trim any possible spaces
    fileName = fileName.toLowerCase().trim();

    // Get the directory data from the file name
    var directoryLocation = krnGetDirectoryFromFileName(fileName);

    // If the file exists read the data otherwise log an error
    if (directoryLocation != null)
    {
        // Get the data from the directory
        var value = JSON.parse(localStorage[directoryLocation]);

        // Get the track, sector, and block of the file location
        var track = value[1];
        var sector = value[2];
        var block = value[3];

        var fileLocation = JSON.stringify([track, sector, block]);

        // Create an array to keep track of all the possible blocks
        // Add the first block to the array and set it as the beginning key
        var fileDataList = [fileLocation];
        var key = fileLocation;

        // While there are still blocks in the chain keep adding them
        while (key != "[-1,-1,-1]") {
            // Get the track, sector, and block from the file
            var fileValue = JSON.parse(localStorage[key]);
            var nextFileTrack = fileValue[1];
            var nextFileSector = fileValue[2];
            var nextFileBlock = fileValue[3];

            // Get the next block in the chain
            var nextFile = JSON.stringify([nextFileTrack, nextFileSector, nextFileBlock]);

            // If there is a reference to another file add it to file data
            if (nextFile != "[-1,-1,-1]")
            {
                fileDataList.push(nextFile);
            }

            // Make the key the next file
            key = nextFile;
        }

        // Go through the file list and delete each block
        for (var i = 0; i < fileDataList.length; i++) {
            localStorage[fileDataList[i]] = krnSetValue(0, DEFAULT_TSB, "");
        }

        // Finally delete the directory
        localStorage[directoryLocation] = krnSetValue(0, DEFAULT_TSB, "");

        return true;
    }
    else
    {
        hostLog("DELETE: Directory not found", "OS");
        return false;
    }
}

function krnListFiles() {
    // Create an array for all the file names
    var fileList = [];
    // Look through all the keys in local storage
    for (var i in localStorage) {
        // Get the key value as all numbers then parse it into an integer
        var keyValue = i.replace(/[[\],]/g, "");
        keyValue = parseInt(keyValue);

        // Check to make sure that the key is in directory space
        if (keyValue > 0 && keyValue < MAX_DIRECTORY_TSB)
        {
            // Get the first bit to check if it is occupied or not
            var value = JSON.parse(localStorage[i]);
            var occupied = value[0];

            // If it is occupied add the file name to the list
            if (occupied === 1)
            {
                // Replace all the tildes with spaces before adding it
                var tempFileName = value[4].replace(/~/g, "");
                fileList.push(tempFileName);
            }
        }
    }

    // If there are any files in the list return the array otherwise return nill
    if (fileList.length > 0)
    {
        return fileList;
    }
    else
    {
        return null;
    }
}

// Add tildes to the end of data both for display and as end of file markers
function krnFillFreeSpace(data) {
    for (var i = data.length; i < (MAX_DATA - 1); i++) {
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
        if (keyValue > 0 && keyValue < MAX_DIRECTORY_TSB)
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
        if (keyValue > MIN_FILE_TSB && keyValue < MAX_FILE_TSB)
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

    if (_MBRLocation[2] > (BLOCK_SIZE - 1))
    {
        _MBRLocation[2] = 0
        _MBRLocation[1]++;
    }
    else if (_MBRLocation[1] > (SECTOR_SIZE - 1))
    {
        _MBRLocation[1] = 0;
        _MBRLocation[0]++;
    }
    else if (_MBRLocation[0] > (TRACK_SIZE - 1))
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

function krnDeleteAllLinkedBlocks(fileName) {
    // Put the file name to lower case and trim any possible spaces
    fileName = fileName.toLowerCase().trim();

    // Get the directory data from the file name
    var directoryLocation = krnGetDirectoryFromFileName(fileName);

    // Get the data from the directory
    var value = JSON.parse(localStorage[directoryLocation]);

    // Get the track, sector, and block of the file location
    var track = value[1];
    var sector = value[2];
    var block = value[3];

    var fileLocation = JSON.stringify([track, sector, block]);

    // Create an array to keep track of all the possible blocks
    // Add the first block to the array and set it as the beginning key
    var fileDataList = [fileLocation];
    var key = fileLocation;

    // While there are still blocks in the chain keep adding them
    while (key != "[-1,-1,-1]") {
        // Get the track, sector, and block from the file
        var fileValue = JSON.parse(localStorage[key]);
        var nextFileTrack = fileValue[1];
        var nextFileSector = fileValue[2];
        var nextFileBlock = fileValue[3];

        // Get the next block in the chain
        var nextFile = JSON.stringify([nextFileTrack, nextFileSector, nextFileBlock]);

        // If there is a reference to another file add it to file data
        if (nextFile != "[-1,-1,-1]")
        {
            fileDataList.push(nextFile);
        }

        // Make the key the next file
        key = nextFile;
    }

    // Go through the file list and delete each block besides the first block because that is always allocated
    // for the file
    for (var i = 1; i < fileDataList.length; i++) {
        localStorage[fileDataList[i]] = krnSetValue(0, DEFAULT_TSB, "");
    }
}