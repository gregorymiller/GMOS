/* ----------------------------------
   DeviceDriverKeyboard.js
   
   Requires deviceDriver.js
   
   The Kernel Keyboard Device Driver.
   ---------------------------------- */

DeviceDriverKeyboard.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

function DeviceDriverKeyboard()                     // Add or override specific attributes and method pointers.
{
    // "subclass"-specific attributes.
    // this.buffer = "";    // TODO: Do we need this?
    // Override the base method pointers.
    this.driverEntry = krnKbdDriverEntry;
    this.isr = krnKbdDispatchKeyPress;
    // "Constructor" code.
}

function krnKbdDriverEntry()
{
    // Initialization routine for this, the kernel-mode Keyboard Device Driver.
    this.status = "loaded";
    // More?
}

function krnKbdDispatchKeyPress(params)
{
    // Parse the params.    TODO: Check that they are valid and osTrapError if not.
    var keyCode = params[0];
    var isShifted = params[1];
    krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
    var chr = "";
    // Check to see if we even want to deal with the key that was pressed.
    if ( ((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
         ((keyCode >= 97) && (keyCode <= 123)) )   // a..z
    {
        // Determine the character we want to display.  
        // Assume it's lowercase...
        chr = String.fromCharCode(keyCode + 32);
        // ... then check the shift key and re-adjust if necessary.
        if (isShifted)
        {
            chr = String.fromCharCode(keyCode);
        }
        // TODO: Check for caps-lock and handle as shifted if so.
        _KernelInputQueue.enqueue(chr);        
    }    
    else if ( ((keyCode >= 48) && (keyCode <= 57)) ||   // digits 
               (keyCode == 32)                     ||   // space
               (keyCode == 13)                     ||   // enter
               (keyCode == 61)                     ||   // equal sign
               (keyCode == 44) )                        // Testing
    {
        chr = String.fromCharCode(keyCode);
        _KernelInputQueue.enqueue(chr); 
    }
    else if ( keyCode == 59 )                         // semicolon and colon
    {
        chr = String.fromCharCode(keyCode);

        if (isShifted)
        {
            chr = String.fromCharCode(keyCode - 1);
        }

        _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 188 )    // Works but gross
    {
       chr = String.fromCharCode(44);
       _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 190 )    // Works but gross
    {
        chr = String.fromCharCode(46);
        _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 222 )    // Works but gross
    {
        chr = String.fromCharCode(39);

        if (isShifted)
        {
            chr = String.fromCharCode(34);
        }
        _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 8 )
    {
        chr = String.fromCharCode(127);
        _KernelInputQueue.enqueue(chr);
    }
}
