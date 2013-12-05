/* ------------
 MemoryManager.js

 The OS Memory Manager - Handles memory interaction.
 ------------ */

function memoryManager()
{
    // Create three memory sections for the three programs to be loaded into memory
    this.memorySections = {
        one: {
            base: 0,
            limit: (PARTITION_SIZE - 1),
            section: 1,
            locked: false
        },

        two: {
            base: PARTITION_SIZE,
            limit: (PARTITION_SIZE + PARTITION_SIZE - 1),
            section: 2,
            locked: false
        },

        three: {
            base: (PARTITION_SIZE + PARTITION_SIZE),
            limit: (PARTITION_SIZE + PARTITION_SIZE + PARTITION_SIZE - 1),
            section: 3,
            locked: false
        }
    };

    // Make sure that a process is within its start and end and correct partition
    this.isValidAddress = function(address) {
        var base = _RunningProcess.base;
        var limit = _RunningProcess.limit;
        return ( address >= base && address <= limit );
    };

    // Get the next byte in memory
    this.getNextByte = function() {
        return _Memory[ (++_CPU.PC) + _RunningProcess.base ];
    };

    // Load the given memory section
    this.loadMemorySection = function(section, opCodeArray) {
        if (section === 1)
        {
            for (var i = this.memorySections.one.base; i < (this.memorySections.one.base + opCodeArray.length); i++)
            {
                _Memory[i] = opCodeArray[i - this.memorySections.one.base].toUpperCase();
            }
        }
        else if (section === 2)
        {
            for (var i = this.memorySections.two.base; i < (this.memorySections.two.base + opCodeArray.length); i++)
            {
                _Memory[i] = opCodeArray[i - this.memorySections.two.base].toUpperCase();
            }
        }
        else if (section === 3)
        {
            for (var i = this.memorySections.three.base; i < (this.memorySections.three.base + opCodeArray.length); i++)
            {
                _Memory[i] = opCodeArray[i - this.memorySections.three.base].toUpperCase();
            }
        }
    };

    // Clear a given memory section
    this.clearMemorySection = function(section) {
        if (section === 1)
        {
            for (var i = this.memorySections.one.base; i <= this.memorySections.one.limit; i++)
            {
                _Memory[i] = "00";
            }
        }
        else if (section === 2)
        {
            for (var i = this.memorySections.two.base; i <= this.memorySections.two.limit; i++)
            {
                _Memory[i] = "00";
            }
        }
        else if (section === 3)
        {
            for (var i = this.memorySections.three.base; i <= this.memorySections.three.limit; i++)
            {
                _Memory[i] = "00";
            }
        }
    };

    // Get the program loaded in a given memory section
    this.getMemoryFromMemorySection = function(section) {
        var opCodeArray = [];

        if (section === 1)
        {
            for (var i = this.memorySections.one.base; i <= this.memorySections.one.limit; i++)
            {
                opCodeArray.push(_Memory[i]);
            }
        }
        else if (section === 2)
        {
            for (var i = this.memorySections.two.base; i <= this.memorySections.two.limit; i++)
            {
                opCodeArray.push(_Memory[i]);
            }
        }
        else if (section === 3)
        {
            for (var i = this.memorySections.three.base; i <= this.memorySections.three.limit; i++)
            {
                opCodeArray.push(_Memory[i]);
            }
        }

        return opCodeArray;
    };


    // Get the next unlocked memory section if there are no open memory sections return null
    this.getNextUnlockedSection = function() {
        if(this.memorySections.one.locked === false)
        {
            return this.memorySections.one;
        }
        else if(this.memorySections.two.locked === false)
        {
            return this.memorySections.two;
        }
        else if(this.memorySections.three.locked === false)
        {
            return this.memorySections.three;
        }
        else
        {
            return null;
        }
    };

    // Lock or unlock a memory section or return null if it is an invalid input
    this.toggleMemorySection = function(section) {
        if (section === 1)
        {
            this.memorySections.one.locked = !this.memorySections.one.locked;
        }
        else if (section === 2)
        {
            this.memorySections.two.locked = !this.memorySections.two.locked;
        }
        else if (section === 3)
        {
            this.memorySections.three.locked = !this.memorySections.three.locked;
        }
        else
        {
            return null;
        }
    };

    // Translate the address given to its right section
    this.translateAddress = function(address) {
        return (address + _RunningProcess.base);
    };

    this.rollIn = function(process) {
        hostLog("Rolling in pid: " + process.pid + " to memory", "OS");

        // Get the file name
        var fileName = "pid:" + process.pid.toString();

        // Get the data from the file and then put it in array form split on spaces
        var opCode = krnFileSystemDriver.read(fileName).toUpperCase().trim();
        var opCodeArray = opCode.split(" ");

        var memorySection = _MemoryManager.getNextUnlockedSection();

        // Update the process attributes
        process.base = memorySection.base;
        process.limit = memorySection.limit;
        process.section = memorySection.section;
        process.state = PROCESS_READY;

        // Lock the memory section and then load in the program
        _MemoryManager.toggleMemorySection(process.section);
        _MemoryManager.loadMemorySection(process.section, opCodeArray);

        // Then delete the program from the disk
        krnFileSystemDriver.delete(fileName);

        updateFileSystemDisplay();
        updateTable();
    };

    this.rollOut = function (process) {
        hostLog("Rolling in pid: " + process.pid + " to file system", "OS");

        // Get the file name and retrieve the program from memory
        var fileName = "pid:" + process.pid.toString();
        var opCodeArray = _MemoryManager.getMemoryFromMemorySection(process.section);

        // Unlock and clear the memory section
        _MemoryManager.toggleMemorySection(process.section);
        _MemoryManager.clearMemorySection(process.section);

        // Get the data from the memory array
        var data = opCodeArray.join(" ");

        // Create and write the data to the file
        krnFileSystemDriver.create(fileName);
        krnFileSystemDriver.write(fileName, data);

        // Update the process attributes
        process.base = -1;
        process.limit = -1;
        process.section = -1;
        process.state = PROCESS_ON_DISK;
    };
}

