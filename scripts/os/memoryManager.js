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
            section: 1
        },

        two: {
            base: PARTITION_SIZE,
            limit: (this.base + PARTITION_SIZE - 1),
            section: 2
        },

        three: {
            base: (PARTITION_SIZE + PARTITION_SIZE),
            limit: (this.base + PARTITION_SIZE - 1),
            section: 3
        }
    };

    // Make sure that a process is within its start and end
    this.isValidAddress = function(address) {
        return (address >= _RunningProcess.base && address <= _RunningProcess.limit);
    };

    // Get the next byte in memory
    this.getNextByte = function() {
        return _Memory[++_CPU.PC];
    };

    // Load the given memory section
    this.loadMemorySection = function(section, opCode) {
        if (section == 1)
        {
            for (var i = this.memorySections.one.base; i < (this.memorySections.one.base + opCode.length); i++)
            {
                _Memory[i] = opCode[i - this.memorySections.one.base].toUpperCase();
            }
        }
        else if (section == 2)
        {
            for (var i = this.memorySections.two.base; i < (this.memorySections.two.base + opCode.length); i++)
            {
                _Memory[i] = opCode[i - this.memorySections.two.base].toUpperCase();
            }
        }
        else if (section == 3)
        {
            for (var i = this.memorySections.three.base; i < (this.memorySections.three.base + opCode.length); i++)
            {
                _Memory[i] = opCode[i - this.memorySections.three.base].toUpperCase();
            }
        }
    }

    // Clear a given memory section
    this.clearMemorySection = function(section) {
        if (section == 1)
        {
            for (var i = this.memorySections.one.base; i <= this.memorySections.one.limit; i++)
            {
                _Memory[i] = "00";
            }
        }
        else if (section == 2)
        {
            for (var i = this.memorySections.two.base; i <= this.memorySections.two.limit; i++)
            {
                _Memory[i] = "00";
            }
        }
        else if (section == 3)
        {
            for (var i = this.memorySections.three.base; i <= this.memorySections.three.limit; i++)
            {
                _Memory[i] = "00";
            }
        }
    };

}

