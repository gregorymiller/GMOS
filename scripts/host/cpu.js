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
    this.isStepping = false;
    
    this.init = function() {
        this.PC    = 0;
        this.Acc   = 0;
        this.Xreg  = 0;
        this.Yreg  = 0;
        this.Zflag = 0;      
        this.isExecuting = false;
        this.isStepping = false;
    };

    this.clearCPU = function() {
        this.PC    = 0;
        this.Acc   = 0;
        this.Xreg  = 0;
        this.Yreg  = 0;
        this.Zflag = 0;
        this.isExecuting = false;
        this.isStepping = false;
    };
    
    this.cycle = function() {
        krnTrace("CPU cycle");
        // TODO: Accumulate CPU usage and profiling statistics here.

        // If the cycle count is bigger than the quantum then create a software interrupt to context switch
        if (_Cycle >= QUANTUM)
        {
            _KernelInterruptQueue.enqueue( new Interrupt(SWITCH_IRQ, -1) );
        }

        if (this.PC >= PARTITION_SIZE)
        {
            _KernelInterruptQueue.enqueue( new Interrupt(INVALID_MEM_IRQ, -1) );
        }

        // Fetch and execute
        this.execute(this.fetch());

        // Update CPU, memory, and ready queue display
        updateCPUDisplay();
        updateTable();
        updateReadyQueue();

        // Increment the cycle
        _Cycle++;
    };

    this.update = function (pc, acc, x, y, z) {
        this.PC = pc;
        this.Acc = acc;
        this.Xreg = x;
        this.Yreg = y;
        this.Zflag = z;
    };

    // Fetch the next byte in memory add the base of the running process to make sure the correct partition
    // is used
    this.fetch = function () {
        return _Memory[_MemoryManager.translateAddress(this.PC)];
    };

    // Execute the current byte in memory if it is not a correct op code queue a invalid op code interrupt
    this.execute = function(opCode) {
        if (opCode == "A9")         { loadAccWithConst();  }
        else if (opCode == "AD")    { loadAccFromMem();    }
        else if (opCode == "8D")    { storeAccInMem();     }
        else if (opCode == "6D")    { addWithCarry();      }
        else if (opCode == "A2")    { loadXRegWithConst(); }
        else if (opCode == "AE")    { loadXRegFromMem();   }
        else if (opCode == "A0")    { loadYRegWithConst(); }
        else if (opCode == "AC")    { loadYRegFromMem();   }
        else if (opCode == "EA")    { noOperation();       }
        else if (opCode == "00")    { systemBreak();       }
        else if (opCode == "EC")    { compareXReg();       }
        else if (opCode == "D0")    { branchXBytes();      }
        else if (opCode == "EE")    { incrementByteVal();  }
        else if (opCode == "FF")    { systemCall();        }
        else
        {
            _KernelInterruptQueue.enqueue( new Interrupt(INVALID_OP_IRQ, -1) );
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
    var decAddr = _MemoryManager.translateAddress(parseInt((two + one), 16));

    // Check if it is valid
    // If it is load the ACC else queue an invalid memory request interrupt
    if (_MemoryManager.isValidAddress(decAddr))
    {
        _CPU.Acc = parseInt(_Memory[decAddr], 16);
    }
    else
    {
        _KernelInterruptQueue.enqueue( new Interrupt(INVALID_MEM_IRQ, -1) );
    }

    _CPU.PC++;
}

// 8D
function storeAccInMem() {
    // Get next two bytes from memory
    var one = _MemoryManager.getNextByte();
    var two = _MemoryManager.getNextByte();

    // Get the correct decimal address in the correct order
    var decAddr = _MemoryManager.translateAddress(parseInt((two + one), 16));

    // Check if it is valid
    // If it is store the ACC in memory else queue an invalid memory request interrupt
    if (_MemoryManager.isValidAddress(decAddr))
    {
        // Convert the dec ACC to hex for storage
        var hex = _CPU.Acc.toString(16).toUpperCase();
        _Memory[decAddr] = hex;
    }
    else
    {
        _KernelInterruptQueue.enqueue( new Interrupt(INVALID_MEM_IRQ, -1) );
    }

    _CPU.PC++;
}

// 6D
function addWithCarry() {
    // Get next two bytes from memory
    var one = _MemoryManager.getNextByte();
    var two = _MemoryManager.getNextByte();

    // Get the correct decimal address in the correct order
    var decAddr = _MemoryManager.translateAddress(parseInt((two + one), 16));

    // Check if it is valid
    // If it is add the memory to the ACC else queue an invalid memory request interrupt
    if (_MemoryManager.isValidAddress(decAddr))
    {
        _CPU.Acc += parseInt(_Memory[decAddr], 16);
    }
    else
    {
        _KernelInterruptQueue.enqueue( new Interrupt(INVALID_MEM_IRQ, -1) );
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
    var decAddr = _MemoryManager.translateAddress(parseInt((two + one), 16));

    // Check if it is valid
    // If it is load the XReg else queue an invalid memory request interrupt
    if (_MemoryManager.isValidAddress(decAddr))
    {
        _CPU.Xreg = parseInt(_Memory[decAddr], 16);
    }
    else
    {
        _KernelInterruptQueue.enqueue( new Interrupt(INVALID_MEM_IRQ, -1) );
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
    var decAddr = _MemoryManager.translateAddress(parseInt((two + one), 16));

    // Check if it is valid
    // If it is load the Yreg else queue an invalid memory request interrupt
    if (_MemoryManager.isValidAddress(decAddr))
    {
        _CPU.Yreg = parseInt(_Memory[decAddr], 16);
    }
    else
    {
        _KernelInterruptQueue.enqueue( new Interrupt(INVALID_MEM_IRQ, -1) );
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
    _RunningProcess.update(PROCESS_TERMINATED, _CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);

    // Disable the step button if it was stepping
    document.getElementById("btnStep").disabled = true;

    // Unlock the current section
    _MemoryManager.toggleMemorySection(_RunningProcess.section);


    // Stop the CPU and stop stepping
    _CPU.isExecuting = false;
    _CPU.isStepping = false;

    _KernelInterruptQueue.enqueue( new Interrupt(SWITCH_IRQ, -1) );

    // Put a new prompt on the screen
    _StdOut.putText(_OsShell.promptStr);
}

// EC
function compareXReg() {
    // Get next two bytes from memory
    var one = _MemoryManager.getNextByte();
    var two = _MemoryManager.getNextByte();

    // Get the correct decimal address in the correct order
    var decAddr = _MemoryManager.translateAddress(parseInt((two + one), 16));

    // Check if it is valid
    // If it is compare Xreg to memory location else queue an invalid memory request interrupt
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
        _KernelInterruptQueue.enqueue( new Interrupt(INVALID_MEM_IRQ, -1) );
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
        if (_CPU.PC >= PARTITION_SIZE)
        {
            _CPU.PC -= PARTITION_SIZE;
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
    var decAddr = _MemoryManager.translateAddress(parseInt((two + one), 16));

    // Check if it is valid
    // If it is increment the byte else queue an invalid memory request interrupt
    if (_MemoryManager.isValidAddress(decAddr))
    {
        var decimalForm = parseInt(_Memory[decAddr], 16);
        decimalForm++;

        var hexForm = decimalForm.toString(16).toUpperCase();

        _Memory[decAddr] = hexForm;
    }
    else
    {
        _KernelInterruptQueue.enqueue( new Interrupt(INVALID_MEM_IRQ, -1) );
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
        var decAddr = _MemoryManager.translateAddress(parseInt(_CPU.Yreg));

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