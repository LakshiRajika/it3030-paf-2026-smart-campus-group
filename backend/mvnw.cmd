@echo off
setlocal
title %0

if "%HOME%" == "" (set "HOME=%USERPROFILE%")

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.\

set APP_HOME=%DIRNAME%
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

set PROJECT_HOME=%APP_HOME%
:findProjectHome
if exist "%PROJECT_HOME%\.mvn" goto foundProjectHome
set "PROJECT_HOME=%PROJECT_HOME%\.."
if not "%PROJECT_HOME%" == ".." goto findProjectHome
set PROJECT_HOME=%APP_HOME%
:foundProjectHome

@REM Find java.exe
if not "%JAVA_HOME%" == "" (
    set "JAVACMD=%JAVA_HOME%\bin\java.exe"
) else (
    for %%i in (java.exe) do set "JAVACMD=%%~$PATH:i"
)

if not exist "%JAVACMD%" (
    echo Error: JAVA_HOME is not set and no 'java' command could be found in your PATH.
    exit /b 1
)

set "WRAPPER_JAR=%PROJECT_HOME%\.mvn\wrapper\maven-wrapper.jar"
set "WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain"

if not exist "%WRAPPER_JAR%" (
    set "WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"
    if not exist "%PROJECT_HOME%\.mvn\wrapper" mkdir "%PROJECT_HOME%\.mvn\wrapper"
    echo Downloading Maven wrapper...
    powershell -Command "Invoke-WebRequest -Uri '%WRAPPER_URL%' -OutFile '%WRAPPER_JAR%'"
)

@REM Handle MAVEN_OPTS properly if it's not set
set "JVM_OPTS=-Dmaven.multiModuleProjectDirectory=%PROJECT_HOME%"
if not "%MAVEN_OPTS%" == "" set "JVM_OPTS=%MAVEN_OPTS% %JVM_OPTS%"

echo Running: "%JAVACMD%" -classpath "%WRAPPER_JAR%" %JVM_OPTS% %WRAPPER_LAUNCHER% %*

"%JAVACMD%" -classpath "%WRAPPER_JAR%" %JVM_OPTS% %WRAPPER_LAUNCHER% %*

if ERRORLEVEL 1 exit /b 1
exit /b 0
