#! /usr/bin/sh

sudo cpupower  frequency-set -g performance
CPU_MASK=0x000000f0 # 4 CPU
NICENESS=0

nice -n $NICENESS taskset $CPU_MASK npm run bench

sudo cpupower frequency-set --governor powersave
