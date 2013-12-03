/* ------------
 Scheduler.js

 Handles the round robin scheduling by performing context switching
 ------------ */

function Scheduler()
{
    this.contextSwitch = function() {
        // Check to make sure that there is something next in the ready queue
        if (_ReadyQueue.peek())
        {
            // If the process has not finished running update its pcb and put it back on the ready queue
            if (_RunningProcess.state != PROCESS_TERMINATED)
            {
                _RunningProcess.update(PROCESS_READY, _CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);

                _ReadyQueue.enqueue(_RunningProcess);
            }

            // Get the next process in the queue
            _RunningProcess = _ReadyQueue.dequeue();

            // If the process to be run is on the disk
            if (_RunningProcess.limit === -1)
            {
                // If there are still processes in the ready queue and there are no unlocked sections roll out
                // the last program in the ready queue
                if ((!_ReadyQueue.isEmpty()) && (_MemoryManager.getNextUnlockedSection() === null))
                {
                    _MemoryManager.rollOut(_ReadyQueue.get(_ReadyQueue.getSize() - 1));
                }
                _MemoryManager.rollIn(_RunningProcess);
            }

            // Clear and update the cpu with the process information
            _CPU.clearCPU();
            _CPU.update(_RunningProcess.pc, _RunningProcess.Acc, _RunningProcess.Xreg, _RunningProcess.Yreg,
                _RunningProcess.Zflag);

            // If the cpu is stopped because a program terminated from finishing execution
            // or being killed restart the cpu
            if (!_CPU.isExecuting)
            {
                _CPU.isExecuting = true;
            }

            hostLog("Context Switch to PID: " + _RunningProcess.pid.toString(), "OS");
        }

        // Even if there is not a context switch reset the cycle count so a single program can continue execution
        _Cycle = 0;
    };
}