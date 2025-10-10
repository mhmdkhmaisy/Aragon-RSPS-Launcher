@echo off
echo Building Windows Installer with Windows JRE only...
echo.

REM Backup other JRE folders temporarily
if exist "src-tauri\resources\jre\macos" (
    echo Temporarily moving macOS JRE...
    move "src-tauri\resources\jre\macos" "src-tauri\resources\jre\macos.tmp" >nul
)

if exist "src-tauri\resources\jre\linux" (
    echo Temporarily moving Linux JRE...
    move "src-tauri\resources\jre\linux" "src-tauri\resources\jre\linux.tmp" >nul
)

echo.
echo Building installer...
call npm run tauri:build

REM Restore other JRE folders
if exist "src-tauri\resources\jre\macos.tmp" (
    echo Restoring macOS JRE...
    move "src-tauri\resources\jre\macos.tmp" "src-tauri\resources\jre\macos" >nul
)

if exist "src-tauri\resources\jre\linux.tmp" (
    echo Restoring Linux JRE...
    move "src-tauri\resources\jre\linux.tmp" "src-tauri\resources\jre\linux" >nul
)

echo.
echo Windows installer built successfully!
echo Location: src-tauri\target\release\bundle\msi\
pause
