/* ------------
 displayUpdater.js

Updates different parts of the display
 ------------ */


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

function updateReadyQueue() {
    clearReadyQueue();

    for (var i = 0; i < _ReadyQueue.getSize(); i++) {
        if ((_ReadyQueue.get(i) != null || _ReadyQueue.get(i) != undefined) && i < 2)
        {
            document.getElementById("RQ" + (i + 1) + "PID").innerHTML     = _ReadyQueue.get(i).pid.toString();
            document.getElementById("RQ" + (i + 1) + "State").innerHTML   = changeState(_ReadyQueue.get(i).state).toString();
            document.getElementById("RQ" + (i + 1) + "Base").innerHTML    = "0x" + _ReadyQueue.get(i).base.toString(16).toUpperCase();
            document.getElementById("RQ" + (i + 1) + "Limit").innerHTML   = "0x" + _ReadyQueue.get(i).limit.toString(16).toUpperCase();
        }
        else
        {
            document.getElementById("RQ" + (i + 1) + "PID").innerHTML     = "&nbsp;";
            document.getElementById("RQ" + (i + 1) + "State").innerHTML   = "&nbsp;";
            document.getElementById("RQ" + (i + 1) + "Base").innerHTML    = "&nbsp;";
            document.getElementById("RQ" + (i + 1) + "Limit").innerHTML   = "&nbsp;";
        }
    }
}

function clearReadyQueue() {
    // Get the table id
    var table = document.getElementById("readyQueue");

    // Update the rows with the new memory value
    for (var r = 1; r < 3; r++) {
        for (var c = 0; c < 4; c++) {
            table.rows[r].cells[c].innerHTML = "&nbsp;";
        }
    }
}

function changeState(state) {
    if (state === 0)
    {
        return "New";
    }
    else if (state === 1)
    {
        return "Loaded";
    }
    else if (state === 2)
    {
        return "Ready";
    }
    else if (state === 3)
    {
        return "Running";
    }
    else if (state === 4)
    {
        return "Terminated";
    }
}