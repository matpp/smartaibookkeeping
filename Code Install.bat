@echo off
setlocal

:: Step 1: Install Capacitor dependencies
echo Installing Capacitor core, CLI, and Android platform...
call npm install @capacitor/core
call npm install -D @capacitor/cli @capacitor/android

:: Step 2: Initialize Capacitor if capacitor.config.ts/json does not exist
if not exist "capacitor.config.json" (
    if not exist "capacitor.config.ts" (
        echo Initializing Capacitor...
        call npx cap init "My App" "com.example.myapp" --web-dir dist
    )
)

:: Step 3: Build the web project
echo Building web assets...
call npm run build

:: Step 4: Add Android platform if not added
if not exist "android" (
    echo Adding Android platform...
    call npx cap add android
)

:: Step 5: Sync web assets with Android project
echo Syncing project files...
call npx cap sync android

:: Step 6: Launch Android Studio
echo Opening Android Studio...
call npx cap open android

echo Done!
pause