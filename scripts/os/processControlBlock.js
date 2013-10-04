/* ------------
 ProcessControlBlock.js

 Process Control Block prototype
 ------------ */

function processControlBlock (state, pid, pc, base, limit, section)
{
    this.state = state;
    this.pid = pid
    this.pc = pc;
    this.base = base;
    this.limit = limit;
    this.section = section;

    this.Acc   = 0;
    this.Xreg  = 0;
    this.Yreg  = 0;
    this.Zflag = 0;

    this.update = function (state, pc, acc, x, y, z) {
        this.state = state;
        this.pc = pc;
        this.Acc = acc;
        this.Xreg = x;
        this.Yreg = y;
        this.Zflag = z;
    }
}