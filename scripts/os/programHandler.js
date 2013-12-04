/* ------------
 ProgramHandler.js

 Handles loading program into memory
 ------------ */


function loadProgram(txt, priority) {
    // Retrieve the program text
    txt = txt.split(" ");

    // If the program is larger than the available partition size then return -1
    if (txt.length >= PARTITION_SIZE)
    {
        _StdOut.putText("Program too large");
        _StdOut.advanceLine();
        _StdOut.putText("Program not loaded correctly");
        _StdOut.advanceLine();
        return -1;
    }

    // Check to know where the program will be loaded
    if (_MemoryManager.getNextUnlockedSection() != null)
    {
        // Get a new process
        var process = newProcess(priority);

        // If the process is not null load the program into memory and add the process to the job list else return -1
        if ( process )
        {
            // Load program into memory
            _MemoryManager.loadMemorySection(process.section, txt);

            // Change process state
            process.state = PROCESS_LOADED;

            // Update table with new memory
            updateTable();

            // Add the process to to the job list at the process's PID
            _JobList[process.pid] = process;

            _StdOut.putText("Program loaded correctly");
            _StdOut.advanceLine();

            // Change the state
            process.state = PROCESS_READY;

            return process.pid;
        }
        else
        {
            return -1;
        }
    }
    // There are no open memory sections so it will be loaded onto the disk
    else if (_MemoryManager.getNextUnlockedSection() === null)
    {
        // Get a new process
        var process = newProcess(priority);

        // If the process is not null load the program onto the disk and add the process to the job list else return -1
        if ( process )
        {
            // Change process state
            process.state = PROCESS_LOADED;

            // Get the file name and program text because the data sent is in array form and the file system does
            // not support it
            var fileName = "pid: " + process.pid.toString();
            var programText = document.getElementById("taProgramInput").value;

            // Create the file and write the data to it
            krnFileSystemDriver.create(fileName);
            krnFileSystemDriver.write(fileName, programText);

            // Change the state to know it is on the disk
            process.state = PROCESS_ON_DISK;

            // Update the display
            updateFileSystemDisplay();

            // Add the process to to the job list at the process's PID
            _JobList[process.pid] = process;

            _StdOut.putText("Program loaded correctly onto disk");
            _StdOut.advanceLine();

            return process.pid;
        }
        else
        {
            return -1;
        }
    }
    else
    {
        return -1;
    }
}

function newProcess(priority) {
    var state = PROCESS_NEW;
    var pid = _PID++;
    var pc = 0;
    var base;
    var limit;
    var section;
    var memorySection;

    // Get the next open memory section
    memorySection = _MemoryManager.getNextUnlockedSection();

    // If there are memory sections open then set the base, limit, and section
    // Toggle the memory sections and then clear the memory section
    // If there are no memory sections open display the output
    if ( memorySection )
    {
        base = memorySection.base;
        limit = memorySection.limit;
        section = memorySection.section;
        _MemoryManager.toggleMemorySection(section);
        _MemoryManager.clearMemorySection(section);

        return (new processControlBlock(state, pid, pc, base, limit, section, priority));
    }
    else
    {
        // This means it is on disk so give it placeholder variables
        base = -1;
        limit = -1;
        section = -1;

        return (new processControlBlock(state, pid, pc, base, limit, section, priority));
    }

    return null;
}
