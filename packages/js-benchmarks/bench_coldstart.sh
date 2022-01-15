#! /usr/bin/sh

sudo cpupower  frequency-set -g performance
CPU_MASK=0x0000ff00 # 4 CPU
NICENESS=0

nice -n $NICENESS taskset $CPU_MASK npm run bench:node:coldstart:sequential
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:coldstart:addon
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:coldstart:asm
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:coldstart:wasm
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:coldstart:wasm:simd:expl
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:coldstart:wasm:simd:impl
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:coldstart:workers

nice -n $NICENESS taskset $CPU_MASK npm run bench:deno:coldstart:sequential
nice -n $NICENESS taskset $CPU_MASK npm run bench:deno:coldstart:workers

npm run coldstart:process
