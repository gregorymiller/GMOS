/* ------------
 memory.js

 Requires global.js.

 CPU memory prototype
 ------------ */

function memory() {
    var memoryArray = new Array();

    // Initialize all memory with 00
    for(var i = 0; i <= TOTAL_MEMORY; i++)
    {
        memoryArray[i] = "00";
    }

    return memoryArray;
}