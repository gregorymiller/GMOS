/* ------------
 Scheduler.js

 Handles the round robin scheduling by performing context switching
 ------------ */

function Scheduler()
{
    this.contextSwitch = function() {
        if (_ReadyQueue.peek())
        {
            if (_RunningProcess.state != PROCESS_TERMINATED)
            {
                _RunningProcess.update(PROCESS_READY, _CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);

                _ReadyQueue.enqueue(_RunningProcess);
            }

            _RunningProcess = _ReadyQueue.dequeue();

            _CPU.clearCPU();
            _CPU.update(_RunningProcess.pc, _RunningProcess.Acc, _RunningProcess.Xreg, _RunningProcess.Yreg, _RunningProcess.Zflag);

            if (!_CPU.isExecuting)
            {
                _CPU.isExecuting = true;
            }

            hostLog("Context Switch to PID: " + _RunningProcess.pid.toString(), "OS");
        }

        _Cycle = 0;
    };
}