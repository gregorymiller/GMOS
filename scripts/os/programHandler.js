/* ------------
 ProgramHandler.js

 Handles loading program into memory
 ------------ */


function loadProgram(txt) {
    // Get a new PCB for the program
    var process = newProcess();

    // If the process is not null load the program into memory and add the process to the job list else return -1
    if ( process )
    {
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

function newProcess() {
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

        return (new processControlBlock(state, pid, pc, base, limit, section));
    }
    else
    {
        _StdOut.putText("No open memory sections");
        _StdOut.advanceLine();
        _StdOut.putText("Program not loaded correctly");
        _StdOut.advanceLine();
    }

    return null;
}
