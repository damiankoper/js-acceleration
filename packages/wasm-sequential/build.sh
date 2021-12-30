#!/bin/bash
if [ -z "${EMSCRIPTEN_HOME}" ]; 
    then echo "EMSCRIPTEN_HOME must be defined"; 
    exit 0;
fi

source "$EMSCRIPTEN_HOME/emsdk_env.sh" > /dev/null 2>&1
emcc \
    src/wasm_sequential.cc \
    node_modules/cpp-sequential/src/SHTSequentialSimpleLookup.cpp \
    node_modules/cpp-sequential/src/SHTSequentialSimple.cpp \
    -Inode_modules/cpp-sequential/include \
    --bind \
    -o build/wasmSequential.js \
    -s MODULARIZE
