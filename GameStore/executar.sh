#!/bin/sh
cd "$(dirname "$0")" || exit 1
exec java -Dfile.encoding=UTF-8 -jar dist/GameStore.jar "$@"
