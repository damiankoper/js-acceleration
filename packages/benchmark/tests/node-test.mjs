import { Benchmark } from "../dist/main.mjs";

console.log(Benchmark);
setTimeout(() => {
  const ben = new Benchmark(function () {
    for (let index = 0; index < 2000; index++) {
      Function.prototype();
    }
  });

  console.log(ben.runTimeIterations({ minTime: 5000, minSamples: 30 }));
}, 0);
