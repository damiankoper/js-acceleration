import { Benchmark } from "../Benchmark";

describe("Benchmark iterations", () => {
  const ben = new Benchmark(function () {
    for (let index = 0; index < 2000; index++) {
      Function.prototype();
    }
  });

  it("should test for loop iterations with startup", () => {
    const results = ben.runIterations({ samples: 30, microRuns: 100 });

    expect(results).toBeDefined();
    console.log(results.mean / 1000, ben.getSamples().length);
  });

  it("should test for loop iterations with steady state", () => {
    const results = ben.runIterations({
      samples: 50,
      microRuns: 50,
      steadyState: true,
      cov: 0.01,
      covWindow: 100,
    });

    expect(results).toBeDefined();
    console.log(results, ben.getSamples().length);
  });
});
