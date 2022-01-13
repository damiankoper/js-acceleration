#! /usr/bin/sh

sudo cpupower  frequency-set -g performance
CPU_MASK=0x0000000f # 4 CPU
NICENESS=0

nice -n $NICENESS taskset $CPU_MASK npm run bench:node:sequential
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:addon
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:asm
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:wasm
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:wasm:simd:expl
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:wasm:simd:impl
nice -n $NICENESS taskset $CPU_MASK npm run bench:node:workers

nice -n $NICENESS taskset $CPU_MASK npm run bench:deno:sequential
nice -n $NICENESS taskset $CPU_MASK npm run bench:deno:workers

sudo cpupower frequency-set --governor powersave
