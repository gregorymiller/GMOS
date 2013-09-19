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
               (keyCode == 13) )                        // enter
    {
        chr = String.fromCharCode(keyCode);

        if (isShifted && keyCode == 48)          // right parentheses
        {
            chr = String.fromCharCode(41);
        }
        else if (isShifted && keyCode == 49)    // exclamation point
        {
            chr = String.fromCharCode(33);
        }
        else if (isShifted && keyCode == 50)    // at symbol
        {
            chr = String.fromCharCode(64);
        }
        else if (isShifted && keyCode == 51)    // pound sign
        {
            chr = String.fromCharCode(35);
        }
        else if (isShifted && keyCode == 52)    // dollar sign
        {
            chr = String.fromCharCode(36);
        }
        else if (isShifted && keyCode == 53)    // percent sign
        {
            chr = String.fromCharCode(37);
        }
        else if (isShifted && keyCode == 54)    // circumflex accent
        {
            chr = String.fromCharCode(94);
        }
        else if (isShifted && keyCode == 55)    // and symbol
        {
            chr = String.fromCharCode(38);
        }
        else if (isShifted && keyCode == 56)    // asterisk
        {
            chr = String.fromCharCode(42);
        }
        else if (isShifted && keyCode == 57)    // left parentheses
        {
            chr = String.fromCharCode(40);
        }

        _KernelInputQueue.enqueue(chr); 
    }
    else if ( keyCode == 59 )                   // semicolon and colon
    {
        chr = String.fromCharCode(keyCode);

        if (isShifted)
        {
            chr = String.fromCharCode(keyCode - 1);
        }

        _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 188 )    // comma and less than
    {
       chr = String.fromCharCode(44);

       if (isShifted)
       {
           chr = String.fromCharCode(60);
       }
       _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 190 )    // period and greater than
    {
        chr = String.fromCharCode(46);

        if (isShifted)
        {
            chr = String.fromCharCode(62);
        }
        _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 222 )    // single and double quote
    {
        chr = String.fromCharCode(39);

        if (isShifted)
        {
            chr = String.fromCharCode(34);
        }
        _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 8 )    // backspace
    {
        chr = String.fromCharCode(127);
        _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 38 )   // up arrow
    {
        chr = String.fromCharCode(2191);
        _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 40 )   // down arrow
    {
        chr = String.fromCharCode(2193);
        _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 191 )  // forward slash and question mark
    {
        chr = String.fromCharCode(47);

        if (isShifted)
        {
            chr = String.fromCharCode(63);
        }
        _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 219 )  // open bracket and curly brace
    {
        chr = String.fromCharCode(91);

        if (isShifted)
        {
            chr = String.fromCharCode(123);
        }
        _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 221 )  // close bracket and curly brace
    {
        chr = String.fromCharCode(93);

        if (isShifted)
        {
            chr = String.fromCharCode(125);
        }
        _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 220 )  // backslash and vertical bar
    {
        chr = String.fromCharCode(92);

        if (isShifted)
        {
            chr = String.fromCharCode(124);
        }
        _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 61 )  // equal and addition sign
    {
        chr = String.fromCharCode(keyCode);

        if (isShifted)
        {
            chr = String.fromCharCode(43);
        }
        _KernelInputQueue.enqueue(chr);
    }
    else if ( keyCode == 173 )  // hyphen and underscore
    {
        chr = String.fromCharCode(45);

        if (isShifted)
        {
            chr = String.fromCharCode(95);
        }
        _KernelInputQueue.enqueue(chr);
    }
    else
    {
        if (!isShifted)
        {
            krnTrapError("Invalid key press");
        }
    }
}
