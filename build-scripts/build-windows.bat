@echo off
REM Aragon Launcher - Windows Build Script
REM This script builds the Windows installer using jpackage

echo ========================================
echo Building Aragon Launcher for Windows
echo ========================================

REM Step 1: Clean and build with Maven
echo.
echo [1/4] Building JAR with Maven...
call mvn clean package
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven build failed!
    pause
    exit /b 1
)

REM Step 2: Create custom JRE
echo.
echo [2/4] Creating custom JRE with jlink...
if exist "build\runtime" rmdir /s /q build\runtime
jlink --add-modules java.base,java.desktop,java.logging,java.naming,java.sql,javafx.controls,javafx.fxml,javafx.graphics --output build\runtime
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: jlink failed! Make sure JDK 17+ is installed.
    pause
    exit /b 1
)

REM Step 3: Prepare build directory
echo.
echo [3/4] Preparing build directory...
if not exist "build\input" mkdir build\input
copy target\aragon-launcher-1.0.0.jar build\input\launcher.jar

REM Step 4: Create Windows installer
echo.
echo [4/4] Creating Windows installer with jpackage...
jpackage ^
  --input build\input ^
  --main-jar launcher.jar ^
  --main-class com.aragon.launcher.Main ^
  --runtime-image build\runtime ^
  --name "Aragon Launcher" ^
  --app-version 1.0.0 ^
  --vendor "Aragon Studios" ^
  --icon src\main\resources\images\icon.png ^
  --type exe ^
  --win-menu ^
  --win-shortcut ^
  --win-dir-chooser ^
  --dest build\installers

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo Installer created: build\installers\Aragon Launcher-1.0.0.exe
    echo.
) else (
    echo ERROR: jpackage failed!
)

pause
