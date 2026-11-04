#!/bin/sh
set -eu
cd "$(dirname "$0")"
mkdir -p build/classes build/test/classes
javac --release 17 -encoding UTF-8 -Xlint:all -Werror -cp 'lib/*' -d build/classes ../GameStore/src/br/com/gamestore/*.java src/br/com/gamestore/testes/*.java
javac --release 17 -encoding UTF-8 -Xlint:all -Werror -cp 'lib/*:build/classes' -d build/test/classes test/br/com/gamestore/*.java
java -Dfile.encoding=UTF-8 -cp 'lib/*:build/classes:build/test/classes' br.com.gamestore.testes.TestRunner
