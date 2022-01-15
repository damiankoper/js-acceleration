#! /usr/bin/sh

sudo cpupower  frequency-set -g performance
CPU_MASK=0x0000ff00 # 4 CPU
NICENESS=0

nice -n $NICENESS taskset $CPU_MASK npm run bench:node:theta:sequential
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:theta:addon
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:theta:asm
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:theta:wasm
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:theta:wasm:simd:expl
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:theta:wasm:simd:impl
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:theta:workers

nice -n $NICENESS taskset $CPU_MASK npm run bench:deno:theta:sequential
nice -n $NICENESS taskset $CPU_MASK npm run bench:deno:theta:workers
