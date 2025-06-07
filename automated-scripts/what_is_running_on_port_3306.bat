@echo off
echo Checking port 3306...
echo.

REM Find PID using port 3306
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3306 ^| findstr LISTENING') do (
    set PID=%%a
)

if "%PID%"=="" (
    echo Nothing is running on port 3306.
) else (
    echo Port 3306 is being used by process with PID: %PID%
    echo.

    REM Show process name
    tasklist /FI "PID eq %PID%"
)

pause