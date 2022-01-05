#!/bin/bash
if [ -z "${EMSCRIPTEN_HOME}" ]; 
    then echo "EMSCRIPTEN_HOME must be defined"; 
    exit 0;
fi
source "$EMSCRIPTEN_HOME/emsdk_env.sh" > /dev/null 2>&1

mkdir -p ./build

COMMON_ARGS="-Inode_modules/cpp-sequential/include 
    --bind \
    -s MODULARIZE \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s FILESYSTEM=0 \
    -s SINGLE_FILE=1 \
    -s ENVIRONMENT=web \
    -s EXPORT_ES6=1 \
    -O3
    "

### Non-SIMD

NON_SIMD_ARGS="$COMMON_ARGS \
    src/wasm_sequential.cc \
    node_modules/cpp-sequential/src/SHTSimpleLookup.cpp \
    node_modules/cpp-sequential/src/SHTSimple.cpp"

emcc $(echo $NON_SIMD_ARGS -o build/wasmSequential.mjs)
emcc $(echo $NON_SIMD_ARGS -o build/wasmSequential.wasm --no-entry)
wasm2wat build/wasmSequential.wasm > build/wasmSequential.wat

### Implicit SIMD

IMPLICIT_SIMD_ARGS="$COMMON_ARGS \
    -msimd128 \
    src/wasm_sequential.cc \
    node_modules/cpp-sequential/src/SHTSimpleLookup.cpp \
    node_modules/cpp-sequential/src/SHTSimple.cpp"

emcc $(echo $IMPLICIT_SIMD_ARGS -o build/wasmSequentialImplicitSIMD.mjs)
emcc $(echo $IMPLICIT_SIMD_ARGS -o build/wasmSequentialImplicitSIMD.wasm --no-entry)
wasm2wat build/wasmSequentialImplicitSIMD.wasm > build/wasmSequentialImplicitSIMD.wat

### Explicit SIMD

EXPLICIT_SIMD_ARGS="$COMMON_ARGS \
    -msimd128 \
    src/wasm_sequential_simd.cc \
    src/simd/SHTSimple.cpp \
    src/simd/SHTSimpleLookup.cpp"
    
emcc $(echo $EXPLICIT_SIMD_ARGS -o build/wasmSequentialSIMD.mjs)
emcc $(echo $EXPLICIT_SIMD_ARGS -o build/wasmSequentialSIMD.wasm --no-entry)
wasm2wat build/wasmSequentialSIMD.wasm > build/wasmSequentialSIMD.wat

### asm.js

ASM_ARGS="$COMMON_ARGS \
    -s WASM=0 \
    src/wasm_sequential.cc \
    node_modules/cpp-sequential/src/SHTSimpleLookup.cpp \
    node_modules/cpp-sequential/src/SHTSimple.cpp "
    
emcc $(echo $ASM_ARGS -o build/asmSequential.mjs)
