/* ------------  
   Globals.js

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)
   
   This code references page numbers in the text book: 
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

//
// Global CONSTANTS
//
var APP_NAME = "GMOS";  // Same here
var APP_VERSION = "1.2";   // What did you expect?

var CPU_CLOCK_INTERVAL = 100;   // This is in ms, or milliseconds, so 1000 = 1 second.

var TIMER_IRQ = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                    // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
var SWITCH_IRQ = 2;
var INVALID_OP_IRQ = 3;
var INVALID_MEM_IRQ = 4;

var TOTAL_MEMORY = 768;     // Total memory size
var PARTITION_SIZE = 256;   // Memory section size

// File system global variables
var TRACK_SIZE = 4;
var SECTOR_SIZE = 8;
var BLOCK_SIZE = 8;
var MBR = "[0,0,0]";
var DEFAULT_TSB = [-1, -1, -1];

// PCB state
var PROCESS_NEW     = 0;
var PROCESS_LOADED  = 1;
var PROCESS_READY   = 2;
var PROCESS_RUNNING = 3;
var PROCESS_TERMINATED = 4;

var QUANTUM = 5;

//
// Global Variables
//

var _MBRLocation = [1,0,0];

var _Scheduler = null;

// CPU globals
var _CPU = null;
var _Cycle = 0;

// Memory globals
var _Memory = null;
var _MemoryManager = null;

// Processes globals
var _RunningProcess = null;
var _PID = 0;

// Job list programs
var _JobList = [];


var _OSclock = 0;       // Page 23.

var _Canvas = null;               // Initialized in hostInit().
var _DrawingContext = null;       // Initialized in hostInit().
var _DefaultFontFamily = "sans";  // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;        // Additional space added to font size when advancing a line.

// Default the OS trace to be on.
var _Trace = true;

// OS queues
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;
var _ReadyQueue = null;

// Standard input and output
var _StdIn  = null;
var _StdOut = null;

// UI
var _Console = null;
var _OsShell = null;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;

// Global Device Driver Objects - page 12
var krnKeyboardDriver = null;
var krnFileSystemDriver = null;

// For testing...
var _GLaDOS = null;
