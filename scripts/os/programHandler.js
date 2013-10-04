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

    process.state = PROCESS_LOADED;

    updateTable();

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


    return (new processControlBlock(state, pid, pc, base, limit, section));
}
