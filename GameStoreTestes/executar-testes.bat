@echo off
cd /d "%~dp0"
where javac >nul 2>nul
if errorlevel 1 (
 echo Configure o JDK 17 ou superior no PATH.
 pause
 exit /b 1
)
if not exist build\classes mkdir build\classes
if not exist build\test\classes mkdir build\test\classes
javac --release 17 -encoding UTF-8 -Xlint:all -Werror -cp "lib/*" -d build/classes ../GameStore/src/br/com/gamestore/*.java src/br/com/gamestore/testes/*.java
if errorlevel 1 goto erro
javac --release 17 -encoding UTF-8 -Xlint:all -Werror -cp "lib/*;build/classes" -d build/test/classes test/br/com/gamestore/*.java
if errorlevel 1 goto erro
java -Dfile.encoding=UTF-8 -cp "lib/*;build/classes;build/test/classes" br.com.gamestore.testes.TestRunner
if errorlevel 1 goto erro
pause
exit /b 0
:erro
echo Falha na compilacao ou nos testes.
pause
exit /b 1
