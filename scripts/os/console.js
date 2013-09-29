/* ------------
   Console.js

   Requires globals.js

   The OS Console - stdIn and stdOut by default.
   Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
   ------------ */

function CLIconsole() {
    // Properties
    this.CurrentFont      = _DefaultFontFamily;
    this.CurrentFontSize  = _DefaultFontSize;
    this.CurrentXPosition = 0;
    this.CurrentYPosition = _DefaultFontSize;
    this.buffer = "";
    this.commandsEntered = [];
    var commandPosition = 0;
    
    // Methods
    this.init = function() {
       this.clearScreen();
       this.resetXY();
    };

    this.clearScreen = function() {
       _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
    };

    this.resetXY = function() {
       this.CurrentXPosition = 0;
       this.CurrentYPosition = this.CurrentFontSize;
    };

    this.handleInput = function() {

       while (_KernelInputQueue.getSize() > 0)
       {
           // Get the next character from the kernel input queue.
           var chr = _KernelInputQueue.dequeue();
           // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
           if (chr == String.fromCharCode(13))  //     Enter key
           {
               // The enter key marks the end of a console command, so ...
               // ... tell the shell ...
               _OsShell.handleInput(this.buffer);
               this.commandsEntered.push(this.buffer);
               commandPosition = this.commandsEntered.length;
               // ... and reset our buffer.
               this.buffer = "";
           }
           else if (chr == String.fromCharCode(127))        // Handles backspace
           {
               this.eraseText(this.buffer.charAt(this.buffer.length - 1));
               this.buffer = this.buffer.substring(0, this.buffer.length - 1);
           }
           else if (chr == String.fromCharCode(2191))       // Cycle up through the commands entered
           {
               commandPosition--;

               if(commandPosition < 0)
               {
                   commandPosition = this.commandsEntered.length - 1;
               }

               for (var i = this.buffer.length - 1; i > -1; i--)
               {
                   this.eraseText(this.buffer.charAt(i));
                   this.buffer = this.buffer.substring(0, i);
               }
               this.buffer = "";

               var newCommand = this.commandsEntered[commandPosition];
               for (i = 0; i < newCommand.length; i++)
               {
                   this.putText(newCommand.charAt(i));
                   this.buffer += newCommand.charAt(i);
               }
           }
           else if (chr == String.fromCharCode(2193))       // Cycle down through the commands entered
           {
               commandPosition++;
               if (commandPosition >= (this.commandsEntered.length))
               {
                   commandPosition = 0;
               }

               for (var i = this.buffer.length - 1; i > -1; i--)
               {
                   this.eraseText(this.buffer.charAt(i));
                   this.buffer = this.buffer.substring(0, i);
               }
               this.buffer = "";

               var newCommand = this.commandsEntered[commandPosition];
               for (i = 0; i < newCommand.length; i++)
               {
                   this.putText(newCommand.charAt(i));
                   this.buffer += newCommand.charAt(i);
               }
           }
           // TODO: Write a case for Ctrl-C.
           else
           {
               // This is a "normal" character, so ...
               // ... draw it on the screen...
               this.putText(chr);
               // ... and add it to our buffer.
               this.buffer += chr;
           }
       }
    };

    this.putText = function(text) {
       // My first inclination here was to write two functions: putChar() and putString().
       // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
       // between the two.  So rather than be like PHP and write two (or more) functions that
       // do the same thing, thereby encouraging confusion and decreasing readability, I
       // decided to write one function and use the term "text" to connote string or char.
       if (text !== "")
       {
           // Draw the text at the current X and Y coordinates.

           // Move the current X position.
           var offset = _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, text);

           if((this.CurrentXPosition + offset) >= _Canvas.width)
           {
               this.advanceLine();
           }
           _DrawingContext.drawText(this.CurrentFont, this.CurrentFontSize, this.CurrentXPosition, this.CurrentYPosition, text);
           this.CurrentXPosition = this.CurrentXPosition + offset;
       }
    };

    this.eraseText = function(text)
    {
        if (text !== "")
        {
            var offset = _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, text);
            // Draw the text at the current X and Y coordinates.
            _DrawingContext.backspace(this.CurrentFontSize, this.CurrentXPosition - offset, this.CurrentYPosition);
            // Move the current X position.
            this.CurrentXPosition = this.CurrentXPosition - offset;
        }
    };

    this.advanceLine = function() {
       this.CurrentXPosition = 0;
       this.CurrentYPosition += _DefaultFontSize + _FontHeightMargin;

       if ((this.CurrentYPosition +  _DefaultFontSize + _FontHeightMargin) >= _Canvas.height)
       {
           // Create a temporary canvas to save the drawn data
           var tempCanvas = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);

           // Increase the height of the canvas
           _Canvas.height += (_DefaultFontSize + _FontHeightMargin);

           // Scroll the div with the canvas
           var canvasDiv = document.getElementById("divConsole");
           canvasDiv.scrollTop = canvasDiv.scrollHeight;

           // Repaint
           _DrawingContext.putImageData(tempCanvas, 0, 0);
       }
    };
}
