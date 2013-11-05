/* ------------
   Shell.js
   
   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

function Shell() {
    // Properties
    this.promptStr   = ">";
    this.commandList = [];
    this.curses      = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
    this.apologies   = "[sorry]";
    // Methods
    this.init        = shellInit;
    this.putPrompt   = shellPutPrompt;
    this.handleInput = shellHandleInput;
    this.execute     = shellExecute;
}

function shellInit() {
    var sc = null;
    //
    // Load the command list.

    // ver
    sc = new ShellCommand();
    sc.command = "ver";
    sc.description = "- Displays the current version data.";
    sc.function = function() {
        _StdOut.putText(APP_NAME + " version " + APP_VERSION);
    }
    this.commandList[this.commandList.length] = sc;
    
    // help
    sc = new ShellCommand();
    sc.command = "help";
    sc.description = "- This is the help command. Seek help.";
    sc.function = shellHelp;
    this.commandList[this.commandList.length] = sc;
    
    // shutdown
    sc = new ShellCommand();
    sc.command = "shutdown";
    sc.description = "- Shuts down the virtual OS but leaves the underlying hardware simulation running.";
    sc.function = shellShutdown;
    this.commandList[this.commandList.length] = sc;

    // cls
    sc = new ShellCommand();
    sc.command = "cls";
    sc.description = "- Clears the screen and resets the cursor position.";
    sc.function = shellCls;
    this.commandList[this.commandList.length] = sc;

    // man <topic>
    sc = new ShellCommand();
    sc.command = "man";
    sc.description = "<topic> - Displays the MANual page for <topic>.";
    sc.function = shellMan;
    this.commandList[this.commandList.length] = sc;
    
    // trace <on | off>
    sc = new ShellCommand();
    sc.command = "trace";
    sc.description = "<on | off> - Turns the OS trace on or off.";
    sc.function = shellTrace;
    this.commandList[this.commandList.length] = sc;

    // rot13 <string>
    sc = new ShellCommand();
    sc.command = "rot13";
    sc.description = "<string> - Does rot13 obfuscation on <string>.";
    sc.function = shellRot13;
    this.commandList[this.commandList.length] = sc;

    // prompt <string>
    sc = new ShellCommand();
    sc.command = "prompt";
    sc.description = "<string> - Sets the prompt.";
    sc.function = shellPrompt;
    this.commandList[this.commandList.length] = sc;

    // date
    sc = new ShellCommand();
    sc.command = "date";
    sc.description = "- displays the current date and time.";
    sc.function = function() {
        var currentDate = new Date();
        _StdOut.putText("" + currentDate.toLocaleString());
    }
    this.commandList[this.commandList.length] = sc;

    // whereami
    sc = new ShellCommand();
    sc.command = "whereami";
    sc.description = "- displays the users current location.";
    sc.function = function() {
        _StdOut.putText("At the keyboard silly.");
    };
    this.commandList[this.commandList.length] = sc;

    // load
    sc = new ShellCommand();
    sc.command = "load";
    sc.description = "- loads user program.";
    sc.function = function() {
        var userProgram = document.getElementById("taProgramInput");
        var userText = userProgram.value;

        var pattern = /[^0-9a-fA-F\s]/;

        // If the pattern is found then it is not valid input otherwise load the program
        if (userText.search(pattern) != -1)
        {
            _StdOut.putText("Not valid program text");
        }
        else
        {
            var pid = loadProgram(userText);

            _StdOut.putText("PID: " + pid);
        }
    };
    this.commandList[this.commandList.length] = sc;

    // run
    sc = new ShellCommand();
    sc.command = "run";
    sc.description = "<PID> - runs program with the PID";
    sc.function = function(args) {
        if (args.length > 0)
        {
            // Make sure that the pid given is a valid PID
            if ( _JobList[args] != undefined || _JobList[args] != null )
            {
                // Get the process from the program list and change state
                _RunningProcess = _JobList[args];
                _RunningProcess.state = PROCESS_RUNNING;

                // Clear CPU and start executing
                _CPU.clearCPU();
                _CPU.isExecuting = true;

                // Remove process
                _JobList[args] = null;
            }
            else
            {
                _StdOut.putText("Not a valid PID");
            }
        }
        else
        {
            _StdOut.putText("Usage: run <PID> Please supply a PID");
        }
    };
    this.commandList[this.commandList.length] = sc;

    // runall
    sc = new ShellCommand();
    sc.command = "runall";
    sc.description = "- runs all the programs in memory";
    sc.function = function() {
        // For all the jobs in the job list put them in the ready queue and then begin executing
        for (var i in _JobList) {

            if (_JobList[i] != undefined || _JobList[i] != null)
            {
                _ReadyQueue.enqueue(_JobList[i]);

                _JobList[i] = null;
            }
        }

        // Get the first process for executing
        _RunningProcess = _ReadyQueue.dequeue();

        // Clear CPU and start executing
        _CPU.clearCPU();
        _CPU.isExecuting = true;
    };
    this.commandList[this.commandList.length] = sc;

    // step
    sc = new ShellCommand();
    sc.command = "step";
    sc.description = "<PID> - step on process";
    sc.function = function(args) {
        if (args.length > 0)
        {
            // Make sure that the pid given is a valid PID
            if ( _JobList[args] != undefined || _JobList[args] != null )
            {
                // Get the process from the program list and change state
                _RunningProcess = _JobList[args];
                _RunningProcess.state = PROCESS_RUNNING;

                // Clear CPU and start stepping
                _CPU.clearCPU();
                _CPU.isStepping = true;

                // Enable button to start stepping
                document.getElementById("btnStep").disabled = false;

                // Remove process
                _JobList[args] = null;
            }
            else
            {
                _StdOut.putText("Not a valid PID");
            }
        }
        else
        {
            _StdOut.putText("Usage: step <PID> Please supply a PID");
        }
    };
    this.commandList[this.commandList.length] = sc;

    // status
    sc = new ShellCommand();
    sc.command = "status";
    sc.description = "<string> - display <string> in footer of the page.";
    sc.function = function(args) {
        var footerElement = document.getElementById("status");

        // If multiple arguments are given add them all to text and display it
        if (args.length > 0)
        {
            var text = "";
            for (var i = 0; i < args.length; i++) {
                text += "" + args[i] + " ";
            }
            footerElement.innerHTML = text;
        }
        else
        {
            _StdOut.putText("Usage: status <string>  Please supply a string.");
        }
    };
    this.commandList[this.commandList.length] = sc;

    // quantum
    sc = new ShellCommand();
    sc.command = "quantum";
    sc.description = "<int> - set the Round Robin quantum";
    sc.function = function(args) {
        if (args.length > 0)
        {
            QUANTUM = args;
        }
        else
        {
            _StdOut.putText("Usage: quantum <int>  Please supply a string.");
        }
    };
    this.commandList[this.commandList.length] = sc;

    // Crash the OS
    sc = new ShellCommand();
    sc.command = "bsod";
    sc.description = "- crash the OS.";
    sc.function = function() {
        krnTrapError("User");
    };
    this.commandList[this.commandList.length] = sc;

    // Open url
    sc = new ShellCommand();
    sc.command = "openurl";
    sc.description = "<url> - opens specified url";
    sc.function = function(args) {
        // Create a url pattern
        var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

        // If it is a valid url open the link in a new window
        if (args.length > 0)
        {
            var text = "";
            for (var i = 0; i < args.length; i++) {
                text += "" + args[i] + "";
            }

            if (text.search(pattern) < 0)
            {
                _StdOut.putText("Not a valid url");
            }
            else
            {
                window.open(text, "_blank");
            }
        }
        else
        {
            _StdOut.putText("Usage: openurl <url>  Please supply a string.");
        }
    };
    this.commandList[this.commandList.length] = sc;

    // processes - list the running processes and their IDs
    sc = new ShellCommand();
    sc.command = "processes";
    sc.description = "- display PIDs of all active processes";
    sc.function = function() {
        _StdOut.putText("PID(s) ");

        // Print out the PIDs in memory
        _StdOut.putText("in memory: ");
        for (var i = 0; i < _JobList.length; i++) {

                if (_JobList[i] != undefined || _JobList[i] != null)
                {
                    _StdOut.putText(_JobList[i].pid.toString() + " ");
                }
        }

        // If the cpu is executing print out the current processes running
        if (_CPU.isExecuting || _CPU.isStepping)
        {
            _StdOut.putText(" running: ");
            for (var i = 0; i < _ReadyQueue.getSize(); i++) {

                if (_ReadyQueue.get(i) != undefined || _ReadyQueue.get(i) != null)
                {
                    _StdOut.putText(_ReadyQueue.get(i).pid.toString() + " ");
                }
            }

            _StdOut.putText(_RunningProcess.pid.toString());
        }
    };
    this.commandList[this.commandList.length] = sc;

    // kill <pid> - kills the specified process id.
    sc = new ShellCommand();
    sc.command = "kill";
    sc.description = "<PID> - kill process with the given PID";
    sc.function = function(args) {
        // Get the pid provided and set the removed variable
        var pid = args[0];
        var removed = false;

        if (pid === null || pid === undefined)
        {
            _StdOut.putText("Usage: kill <pid>  Please supply a PID.")
        }
        else
        {
            // Search the ready queue first for the pid
            for (var i = 0; i < _ReadyQueue.getSize(); i++) {

                // If the pid is found toggle the memory selection, remove it from the ready queue
                // and set the removed variable so it knows whether something has been removed
                if (pid === _ReadyQueue.get(i).pid.toString())
                {
                    _StdOut.putText("PID " + pid.toString() + " killed");

                    _MemoryManager.toggleMemorySection(_ReadyQueue.get(i).section);
                    _ReadyQueue.remove(i);

                    removed = true;
                }
            }

            // If the pid is the running process then toggle the memory, update the pcb, stop the cpu, queue a software
            // interrupt if there are more process and set the removed variable
            if (pid === _RunningProcess.pid.toString())
            {
                _StdOut.putText("PID " + pid.toString() + " killed");

                _MemoryManager.toggleMemorySection(_RunningProcess.section);
                _RunningProcess.update(PROCESS_TERMINATED, _CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);

                _CPU.isExecuting = false;
                _CPU.isStepping = false;

                _KernelInterruptQueue.enqueue( new Interrupt(SWITCH_IRQ, -1) );

                removed = true;
            }

            // If nothing is removed
            if (!removed)
            {
                _StdOut.putText("PID not found");
            }
        }
    };
    this.commandList[this.commandList.length] = sc;

    // Display the initial prompt.
    this.putPrompt();
}

function shellPutPrompt()
{
    _StdIn.putText(this.promptStr);
}

function shellHandleInput(buffer)
{
    krnTrace("Shell Command~" + buffer);
    // 
    // Parse the input...
    //
    var userCommand = new UserCommand();
    userCommand = shellParseInput(buffer);
    // ... and assign the command and args to local variables.
    var cmd = userCommand.command;
    var args = userCommand.args;
    //
    // Determine the command and execute it.
    //
    // JavaScript may not support associative arrays in all browsers so we have to
    // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
    var index = 0;
    var found = false;
    while (!found && index < this.commandList.length)
    {
        if (this.commandList[index].command === cmd)
        {
            found = true;
            var fn = this.commandList[index].function;

            // Added this so that it will not put a prompt after the run command
            var fnName = this.commandList[index].command;
        }
        else
        {
            ++index;
        }
    }
    if (found)
    {
        this.execute(fn, args, fnName);
    }
    else
    {
        // It's not found, so check for curses and apologies before declaring the command invalid.
        if (this.curses.indexOf("[" + rot13(cmd) + "]") >= 0)      // Check for curses.
        {
            this.execute(shellCurse);
        }
        else if (this.apologies.indexOf("[" + cmd + "]") >= 0)      // Check for apologies.
        {
            this.execute(shellApology);
        }
        else    // It's just a bad command.
        {
            this.execute(shellInvalidCommand);
        }
    }
}

function shellParseInput(buffer)
{
    var retVal = new UserCommand();

    // 1. Remove leading and trailing spaces.
    buffer = trim(buffer);

    // 2. Lower-case it.
    buffer = buffer.toLowerCase();

    // 3. Separate on spaces so we can determine the command and command-line args, if any.
    var tempList = buffer.split(" ");

    // 4. Take the first (zeroth) element and use that as the command.
    var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
    // 4.1 Remove any left-over spaces.
    cmd = trim(cmd);
    // 4.2 Record it in the return value.
    retVal.command = cmd;

    // 5. Now create the args array from what's left.
    for (var i in tempList)
    {
        var arg = trim(tempList[i]);
        if (arg != "")
        {
            retVal.args[retVal.args.length] = tempList[i];
        }
    }
    return retVal;
}

function shellExecute(fn, args, fnName)
{
    // Changed so that it will not put prompts right after the command
    if (fnName === "bsod")
    {
        // We just got a command, so advance the line...
        _StdIn.advanceLine();
        // ... call the command function passing in the args...
        fn(args);
        // Check to see if we need to advance the line again
        if (_StdIn.CurrentXPosition > 0)
        {
            _StdIn.advanceLine();
        }
    }
    else
    {
        // We just got a command, so advance the line...
        _StdIn.advanceLine();
        // ... call the command function passing in the args...
        fn(args);
        // Check to see if we need to advance the line again
        if (_StdIn.CurrentXPosition > 0)
        {
            _StdIn.advanceLine();
        }
        // ... and finally write the prompt again.
        this.putPrompt();
    }
}


//
// The rest of these functions ARE NOT part of the Shell "class" (prototype, more accurately), 
// as they are not denoted in the constructor.  The idea is that you cannot execute them from
// elsewhere as shell.xxx .  In a better world, and a more perfect JavaScript, we'd be
// able to make then private.  (Actually, we can. have a look at Crockford's stuff and Resig's JavaScript Ninja cook.)
//

//
// An "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function ShellCommand()     
{
    // Properties
    this.command = "";
    this.description = "";
    this.function = "";
}

//
// Another "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function UserCommand()
{
    // Properties
    this.command = "";
    this.args = [];
}


//
// Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
//
function shellInvalidCommand()
{
    _StdIn.putText("Invalid Command. ");
    if (_SarcasticMode)
    {
        _StdIn.putText("Duh. Go back to your Speak & Spell.");
    }
    else
    {
        _StdIn.putText("Type 'help' for, well... help.");
    }
}

function shellCurse()
{
    _StdIn.putText("Oh, so that's how it's going to be, eh? Fine.");
    _StdIn.advanceLine();
    _StdIn.putText("Bitch.");
    _SarcasticMode = true;
}

function shellApology()
{
   if (_SarcasticMode) {
      _StdIn.putText("Okay. I forgive you. This time.");
      _SarcasticMode = false;
   } else {
      _StdIn.putText("For what?");
   }
}

// Fixed so that the text will wrap like other text
function shellHelp(args)
{
    _StdOut.putText("Commands:");
    for (var i in _OsShell.commandList)
    {
        _StdOut.advanceLine();
        _StdOut.putText("  " + _OsShell.commandList[i].command + " ");
        for (var letter = 0; letter < _OsShell.commandList[i].description.length; letter++)
        {
            _StdOut.putText(_OsShell.commandList[i].description.charAt(letter));
        }
    }    
}

function shellShutdown(args)
{
     _StdIn.putText("Shutting down...");

     // Set status
     document.getElementById("status").innerHTML = "Shutdown";

     // Call Kernel shutdown routine.
    krnShutdown();   
    // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
}

function shellCls(args)
{
    _StdIn.clearScreen();
    _StdIn.resetXY();
}

function shellMan(args)
{
    if (args.length > 0)
    {
        var topic = args[0];
        switch (topic)
        {
            case "help": 
                _StdIn.putText("Help displays a list of (hopefully) valid commands.");
                break;
            default:
                _StdIn.putText("No manual entry for " + args[0] + ".");
        }        
    }
    else
    {
        _StdIn.putText("Usage: man <topic>  Please supply a topic.");
    }
}

function shellTrace(args)
{
    if (args.length > 0)
    {
        var setting = args[0];
        switch (setting)
        {
            case "on": 
                if (_Trace && _SarcasticMode)
                {
                    _StdIn.putText("Trace is already on, dumbass.");
                }
                else
                {
                    _Trace = true;
                    _StdIn.putText("Trace ON");
                }
                
                break;
            case "off": 
                _Trace = false;
                _StdIn.putText("Trace OFF");                
                break;                
            default:
                _StdIn.putText("Invalid arguement.  Usage: trace <on | off>.");
        }        
    }
    else
    {
        _StdIn.putText("Usage: trace <on | off>");
    }
}

function shellRot13(args)
{
    if (args.length > 0)
    {
        _StdIn.putText(args[0] + " = '" + rot13(args[0]) +"'");     // Requires Utils.js for rot13() function.
    }
    else
    {
        _StdIn.putText("Usage: rot13 <string>  Please supply a string.");
    }
}

function shellPrompt(args)
{
    if (args.length > 0)
    {
        _OsShell.promptStr = args[0];
    }
    else
    {
        _StdIn.putText("Usage: prompt <string>  Please supply a string.");
    }
}
