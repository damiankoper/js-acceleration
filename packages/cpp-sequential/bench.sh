#! /usr/bin/sh

sudo cpupower  frequency-set -g performance
CPU_MASK=0x000000ff # 4 CPU
NICENESS=0

nice -n $NICENESS taskset $CPU_MASK npm run bench
