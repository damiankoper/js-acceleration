import { Benchmark } from "../Benchmark";

describe("Benchmark time", () => {
  const ben = new Benchmark(function () {
    for (let index = 0; index < 2000; index++) {
      Function.prototype();
    }
  });

  it("should test for loop time with startup", () => {
    const results = ben.runTimeIterations({
      minTime: 500,
      maxTime: 2000,
      minSamples: 5,
      maxSamples: 6000,
      microRuns: 100,
    });

    expect(results).toBeDefined();
    console.log(results, ben.getSamples().length);
  });

  it("should test for loop time with steady state", () => {
    const results = ben.runTimeIterations({
      minTime: 500,
      maxTime: 2000,
      minSamples: 5,
      maxSamples: 6000,
      microRuns: 100,
      steadyState: true,
      cov: 0.01,
      covWindow: 10,
    });

    expect(results).toBeDefined();
    console.log(results, ben.getSamples().length);
  });
});
