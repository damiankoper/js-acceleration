#include "SHTSequentialSimple.h"
#include <emscripten.h>
#include <stdio.h>

extern "C" {

EMSCRIPTEN_KEEPALIVE
int pppp(int *a, SHTOptions options) {
  printf("%f\n", options.votingThreshold);
  printf("hello, world!\n");
  return a[0] + a[1];
}

//
}
