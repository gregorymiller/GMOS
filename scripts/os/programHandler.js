/* ------------
 ProgramHandler.js

 Handles loading program into memory
 ------------ */


function loadProgram(txt) {
    // Get a new PCB for the program
    var process = newProcess();
    txt = txt.split(" ");

    // Go from the memory section base to the end of the program and load it into the program
    for (var i = process.base; i < (process.base + txt.length); i++)
    {
        _Memory[i] = txt[i - process.base].toUpperCase();
    }

    // Change process state
    process.state = PROCESS_LOADED;

    // Update table with new memory
    updateTable();

    // Add the process to to the program list
    // Only using 0 because for now there is only one program
    _ProgramList[0] = process;

    return process.pid;
}

function newProcess() {
    var state = PROCESS_NEW;
    var pid = _PID++;
    var pc = 0;
    var base;
    var limit;
    var section;

    // Get the base, limit, and section for the first memory section
    // Will expand for use with three memory sections
    base = _MemoryManager.memorySections.one.base;
    limit = _MemoryManager.memorySections.one.limit;
    section = _MemoryManager.memorySections.one.section;

    // Clear the memory section you want to load the program in
    _MemoryManager.clearMemorySection(1);


    return (new processControlBlock(state, pid, pc, base, limit, section));
}
