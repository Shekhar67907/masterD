@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo Using JDK at: %JAVA_HOME%
gradlew %*
