import { Benchmark } from "../Benchmark";

describe("Benchmark iterations", () => {
  const ben = new Benchmark(function () {
    for (let index = 0; index < 2000; index++) {
      Function.prototype();
    }
  });

  it("should test for loop iterations with startup", () => {
    const results = ben.runIterations({ samples: 30, microRuns: 20 });

    expect(results).toBeDefined();
    const microRuns = results.samples.reduce((a, b) => a + b.microRuns, 0);
    expect(microRuns).toBeGreaterThanOrEqual(results.samples.length + 20);
  });

  it("should test for loop iterations with steady state", () => {
    const results = ben.runIterations({
      samples: 30,
      microRuns: 20,
      steadyState: true,
      cov: 0.01,
      covWindow: 10,
    });

    expect(results).toBeDefined();
    const microRuns = results.samples.reduce((a, b) => a + b.microRuns, 0);
    expect(microRuns).toBeGreaterThanOrEqual(results.samples.length + 20);
  });
});
