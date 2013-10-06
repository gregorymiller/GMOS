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
            limit: 255,
            section: 1,
            codeLoaded: false
        },

        two: {
            base: 256,
            limit: 511,
            section: 2,
            codeLoaded: false
        },

        three: {
            base: 512,
            limit: 767,
            section: 3,
            codeLoaded: false
        }
    };

    // Make sure that a process is within its start and end
    this.isValidAddress = function(address) {
        return (address >= _RunningProcess.base && address <= _RunningProcess.limit);
    };

    this.getNextByte = function() {
        return _Memory[++_CPU.PC];
    }

}


function tableCreate(){
    // Get the memory display and declare a variable to make sure the correct amount of memory locations are made
    var table = document.getElementById("memory");
    var i = 0;

    for (var r = 0; r < 96; r++) {
        // Create the first column separate from the rest to display the memory location
        var row = table.insertRow(-1);
        var firstCell = row.insertCell(-1);
        firstCell.appendChild(document.createTextNode("0x" + i.toString(16).toUpperCase()));

        // Color the beginning of the different memory sections
        if(i == 0 || i == 256 || i == 512)
        {
            firstCell.style.background="#C0C0C0";
        }

        // Create the correct amount of memory locations showing the default memory value
        for (var c = 0; c < 8; c++) {
            var cell = row.insertCell(-1);
            cell.appendChild(document.createTextNode("00"));
            i++;
        }
    }
}

function updateTable() {
    // Get the table id
    var table = document.getElementById("memory");
    var memoryAddress = 0;

    // Update the rows with the new memory value
    for (var r = 0; r < 96; r++) {
        for (var c = 1; c < 9; c++) {
            table.rows[r].cells[c].innerHTML = _Memory[memoryAddress];
            memoryAddress++;
        }
    }
}

