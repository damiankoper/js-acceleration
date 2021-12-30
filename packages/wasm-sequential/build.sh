#!/bin/bash
if [ -z "${EMSCRIPTEN_HOME}" ]; 
    then echo "EMSCRIPTEN_HOME must be defined"; 
    exit 0;
fi
source "$EMSCRIPTEN_HOME/emsdk_env.sh" > /dev/null 2>&1

### Non-SIMD

emcc \
    src/wasm_sequential.cc \
    node_modules/cpp-sequential/src/SHTSequentialSimpleLookup.cpp \
    node_modules/cpp-sequential/src/SHTSequentialSimple.cpp \
    -Inode_modules/cpp-sequential/include \
    --bind \
    -o build/wasmSequential.js \
    -s MODULARIZE \
    -s ALLOW_MEMORY_GROWTH=1 \
    -O3
    

wasm2wat build/wasmSequential.wasm > build/wasmSequential.wat

### Implicit SIMD

emcc \
    src/wasm_sequential.cc \
    node_modules/cpp-sequential/src/SHTSequentialSimpleLookup.cpp \
    node_modules/cpp-sequential/src/SHTSequentialSimple.cpp \
    -Inode_modules/cpp-sequential/include \
    --bind \
    -o build/wasmSequentialImplicitSIMD.js \
    -s MODULARIZE \
    -msimd128 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -O3 

wasm2wat build/wasmSequentialImplicitSIMD.wasm > build/wasmSequentialImplicitSIMD.wat

### Explicit SIMD

emcc \
    src/wasm_sequential_simd.cc \
    src/simd/SHTSequentialSimple.cpp \
    src/simd/SHTSequentialSimpleLookup.cpp \
    -Inode_modules/cpp-sequential/include \
    --bind \
    -o build/wasmSequentialSIMD.js \
    -s MODULARIZE \
    -msimd128 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -O3

wasm2wat build/wasmSequentialSIMD.wasm > build/wasmSequentialSIMD.wat
