@echo off
cd /d "%~dp0"
java -Dfile.encoding=UTF-8 -jar dist\GameStore.jar --test
pause
