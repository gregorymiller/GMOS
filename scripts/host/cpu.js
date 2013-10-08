/* ------------  
   CPU.js

   Requires global.js.
   
   Routines for the host CPU simulation, NOT for the OS itself.  
   In this manner, it's A LITTLE BIT like a hypervisor,
   in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
   that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
   JavaScript in both the host and client environments.

   This code references page numbers in the text book: 
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

function Cpu() {
    this.PC    = 0;     // Program Counter
    this.Acc   = 0;     // Accumulator
    this.Xreg  = 0;     // X register
    this.Yreg  = 0;     // Y register
    this.Zflag = 0;     // Z-ero flag (Think of it as "isZero".)
    this.isExecuting = false;
    
    this.init = function() {
        this.PC    = 0;
        this.Acc   = 0;
        this.Xreg  = 0;
        this.Yreg  = 0;
        this.Zflag = 0;      
        this.isExecuting = false;
    };

    this.clearCPU = function() {
        this.PC    = 0;
        this.Acc   = 0;
        this.Xreg  = 0;
        this.Yreg  = 0;
        this.Zflag = 0;
        this.isExecuting = false;
    };
    
    this.cycle = function() {
        krnTrace("CPU cycle");
        // TODO: Accumulate CPU usage and profiling statistics here.

        // Fetch and execute
        this.execute(this.fetch());

        // Update CPU and memory display
        updateCPUDisplay();
        updateTable();
    };

    this.update = function (pc, acc, x, y, z) {
        this.PC = pc;
        this.Acc = acc;
        this.Xreg = x;
        this.Yreg = y;
        this.Zflag = z;

    };

    // Fetch the next byte in memory
    this.fetch = function () {
        return _Memory[this.PC];
    };

    // Execute the current byte in memory
    this.execute = function(opCode) {
        if (opCode == "A9")
        {
            loadAccWithConst();
        }
        else if (opCode == "AD")
        {
            loadAccFromMem();
        }
        else if (opCode == "8D")
        {
            storeAccInMem();
        }
        else if (opCode == "6D")
        {
            addWithCarry();
        }
        else if (opCode == "A2")
        {
            loadXRegWithConst();
        }
        else if (opCode == "AE")
        {
            loadXRegFromMem();
        }
        else if (opCode == "A0")
        {
            loadYRegWithConst();
        }
        else if (opCode == "AC")
        {
            loadYRegFromMem();
        }
        else if (opCode == "EA")
        {
            noOperation();
        }
        else if (opCode == "00")
        {
            systemBreak();
        }
        else if (opCode == "EC")
        {
            compareXReg();
        }
        else if (opCode == "D0")
        {
            branchXBytes();
        }
        else if (opCode == "EE")
        {
            incrementByteVal();
        }
        else if (opCode == "FF")
        {
            systemCall();
        }
        else
        {
            systemBreak();
        }
    };
}

// A9
function loadAccWithConst() {
    // Put the next byte's decimal value in the ACC and increment the PC
    _CPU.Acc = parseInt(_MemoryManager.getNextByte(), 16);
    _CPU.PC++;
}

// AD
function loadAccFromMem() {
    // Get next two bytes from memory
    var one = _MemoryManager.getNextByte();
    var two = _MemoryManager.getNextByte();

    // Get the correct decimal address in the correct order
    var decAddr = parseInt((two + one), 16);

    // Check if it is valid
    // If it is load the ACC else crash the OS
    if (_MemoryManager.isValidAddress(decAddr))
    {
        _CPU.Acc = parseInt(_Memory[decAddr], 16);
    }
    else
    {
        krnTrapError("Invalid memory request");
    }

    _CPU.PC++;
}

// 8D
function storeAccInMem() {
    // Get next two bytes from memory
    var one = _MemoryManager.getNextByte();
    var two = _MemoryManager.getNextByte();

    // Get the correct decimal address in the correct order
    var decAddr = parseInt((two + one), 16);

    // Check if it is valid
    // If it is store the ACC in memory else crash the OS
    if (_MemoryManager.isValidAddress(decAddr))
    {
        // Convert the dec ACC to hex for storage
        var hex = _CPU.Acc.toString(16).toUpperCase();
        _Memory[decAddr] = hex;
    }
    else
    {
        krnTrapError("Invalid memory request");
    }

    _CPU.PC++;
}

// 6D
function addWithCarry() {
    // Get next two bytes from memory
    var one = _MemoryManager.getNextByte();
    var two = _MemoryManager.getNextByte();

    // Get the correct decimal address in the correct order
    var decAddr = parseInt((two + one), 16);

    // Check if it is valid
    // If it is add the memory to the ACC else crash the OS
    if (_MemoryManager.isValidAddress(decAddr))
    {
        _CPU.Acc += parseInt(_Memory[decAddr], 16);
    }
    else
    {
        krnTrapError("Invalid memory request");
    }

    _CPU.PC++;
}

// A2
function loadXRegWithConst() {
    // Put the next byte's decimal value in the XReg and increment the PC
    _CPU.Xreg = parseInt(_MemoryManager.getNextByte(), 16);
    _CPU.PC++;
}

// AE
function loadXRegFromMem() {
    // Get next two bytes from memory
    var one = _MemoryManager.getNextByte();
    var two = _MemoryManager.getNextByte();

    // Get the correct decimal address in the correct order
    var decAddr = parseInt((two + one), 16);

    // Check if it is valid
    // If it is load the XReg else crash the OS
    if (_MemoryManager.isValidAddress(decAddr))
    {
        _CPU.Xreg = parseInt(_Memory[decAddr], 16);
    }
    else
    {
        krnTrapError("Invalid memory request");
    }

    _CPU.PC++;
}

// A0
function loadYRegWithConst() {
    // Put the next byte's decimal value in the YReg and increment the PC
    _CPU.Yreg = parseInt(_MemoryManager.getNextByte(), 16);
    _CPU.PC++;
}

// AC
function loadYRegFromMem() {
    // Get next two bytes from memory
    var one = _MemoryManager.getNextByte();
    var two = _MemoryManager.getNextByte();

    // Get the correct decimal address in the correct order
    var decAddr = parseInt((two + one), 16);

    // Check if it is valid
    // If it is load the Yreg else crash the OS
    if (_MemoryManager.isValidAddress(decAddr))
    {
        _CPU.Yreg = parseInt(_Memory[decAddr], 16);
    }
    else
    {
        krnTrapError("Invalid memory request");
    }

    _CPU.PC++;
}

// EA
function noOperation() {
    // Only need to increment PC
    _CPU.PC++;
}

// 00
function systemBreak() {
    // Update the PCB of the process
    _RunningProcess.update(PROCESS_STOPPED, _CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);

    // Stop the CPU and
    _CPU.isExecuting = false;

    // Put a new prompt on the screen
    _StdOut.putText(_OsShell.promptStr);
}

// EC
function compareXReg() {
    // Get next two bytes from memory
    var one = _MemoryManager.getNextByte();
    var two = _MemoryManager.getNextByte();

    // Get the correct decimal address in the correct order
    var decAddr = parseInt((two + one), 16);

    // Check if it is valid
    // If it is compare Xreg to memory location else crash the OS
    if (_MemoryManager.isValidAddress(decAddr))
    {
        if (parseInt(_Memory[decAddr], 16) == _CPU.Xreg)
        {
            _CPU.Zflag = 1;
        }
        else
        {
            _CPU.Zflag = 0;
        }
    }
    else
    {
        krnTrapError("Invalid memory request");
    }

    _CPU.PC++;
}

// D0
function branchXBytes() {
    if (_CPU.Zflag == 0)
    {
        // Get the branch value and branch
        var branchVal = parseInt(_MemoryManager.getNextByte(), 16);
        _CPU.PC += branchVal;

        // Check to make sure you have not branched out of memory
        if (_CPU.PC > 255)
        {
            _CPU.PC -= 256;
        }

        _CPU.PC++;
    }
    else
    {
        // If not skip over the next value as well as the op code
        _CPU.PC += 2;
    }
}

// EE
function incrementByteVal() {
    // Get next two bytes from memory
    var one = _MemoryManager.getNextByte();
    var two = _MemoryManager.getNextByte();

    // Get the correct decimal address in the correct order
    var decAddr = parseInt((two + one), 16);

    // Check if it is valid
    // If it is increment the byte else crash the OS
    if (_MemoryManager.isValidAddress(decAddr))
    {
        var decimalForm = parseInt(_Memory[decAddr], 16);
        decimalForm++;

        var hexForm = decimalForm.toString(16).toUpperCase();

        _Memory[decAddr] = hexForm;
    }
    else
    {
        krnTrapError("Invalid memory request");
    }

    _CPU.PC++;
}

// FF
function systemCall() {
    // Print value in Yreg
    if (_CPU.Xreg == 1)
    {
        // Get the string value of the Yreg
        var valueText = _CPU.Yreg.toString();

        // Display the text and advance the line
        _StdOut.putText(valueText);
        _Console.advanceLine();
    }
    // Print the 00-terminated string stored at the address in the Yreg
    else if (_CPU.Xreg == 2)
    {
        // Get the dec address of the hex value stored in the Yreg
        var decAddr = parseInt(_CPU.Yreg);

        // Store the current byte in memory
        var currentByte = _Memory[decAddr];

        // Create keyCode and chr for use in loop
        var keyCode = 0;
        var chr = "";

        while (currentByte != "00")
        {
            // Convert the current byte to a decimal key code
            keyCode = parseInt(currentByte, 16);

            // Get the character and display the character
            chr = String.fromCharCode(keyCode);
            _StdOut.putText(chr);

            // Increment the address and get the next byte
            decAddr++;
            currentByte = _Memory[decAddr];
        }

        // Advance a line after output is complete
        _Console.advanceLine();

    }
    _CPU.PC++;
}

function updateCPUDisplay() {
    // Update the hex side
    document.getElementById("CPUPCHEX").innerHTML  = "0x" + _CPU.PC.toString(16).toUpperCase();
    document.getElementById("CPUACCHEX").innerHTML = "0x" + _CPU.Acc.toString(16).toUpperCase();
    document.getElementById("CPUXHEX").innerHTML   = "0x" + _CPU.Xreg.toString(16).toUpperCase();
    document.getElementById("CPUYHEX").innerHTML   = "0x" + _CPU.Yreg.toString(16).toUpperCase();
    document.getElementById("CPUZHEX").innerHTML   = "0x" + _CPU.Zflag.toString(16).toUpperCase();

    // Update the decimal side
    document.getElementById("CPUPCDEC").innerHTML  = _CPU.PC.toString();
    document.getElementById("CPUACCDEC").innerHTML = _CPU.Acc.toString();
    document.getElementById("CPUXDEC").innerHTML   = _CPU.Xreg.toString();
    document.getElementById("CPUYDEC").innerHTML   = _CPU.Yreg.toString();
    document.getElementById("CPUZDEC").innerHTML   = _CPU.Zflag.toString();
}