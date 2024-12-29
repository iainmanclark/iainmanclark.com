@echo off
echo Starting development server...

:: Kill any existing Python processes
taskkill /F /IM python.exe 2>nul

:: Clear the command prompt
cls

:: Start the server with specific settings
python -m http.server 8000 --bind 127.0.0.1

:: If the server fails to start, pause to show any error messages
if errorlevel 1 (
    echo.
    echo Failed to start server. Check if port 8000 is already in use.
    pause
)
