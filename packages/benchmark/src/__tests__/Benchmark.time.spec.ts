import { Benchmark } from "../Benchmark";

describe("Benchmark time", () => {
  const ben = new Benchmark(function () {
    for (let index = 0; index < 2000; index++) {
      Function.prototype();
    }
  });

  const benAsync = new Benchmark(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, 20);
      })
  );

  it("should test for loop time with startup", () => {
    const results = ben.runTimeIterations({
      minTime: 200,
      minSamples: 30,
      microRuns: 20,
    });

    expect(results).toBeDefined();
    const microRuns = results.samples.reduce((a, b) => a + b.microRuns, 0);
    expect(microRuns).toBeGreaterThanOrEqual(results.samples.length + 20);
  });

  it("should test for async loop time with startup", async () => {
    const results = await benAsync.runTimeIterationsAsync({
      minTime: 200,
      minSamples: 20,
      microRuns: 1,
    });

    expect(results).toBeDefined();
    const microRuns = results.samples.reduce((a, b) => a + b.microRuns, 0);
    expect(microRuns).toBeGreaterThanOrEqual(results.samples.length);
  });

  it("should test for loop time with steady state", () => {
    const results = ben.runTimeIterations({
      minTime: 200,
      minSamples: 30,
      microRuns: 20,
      steadyState: true,
      cov: 0.01,
      covWindow: 10,
    });

    expect(results).toBeDefined();
    const microRuns = results.samples.reduce((a, b) => a + b.microRuns, 0);
    expect(microRuns).toBeGreaterThanOrEqual(results.samples.length + 20);
  });

  it("should test for async loop time with steady state", async () => {
    const results = await benAsync.runTimeIterationsAsync({
      minTime: 200,
      minSamples: 30,
      microRuns: 1,
      steadyState: true,
      cov: 0.01,
      covWindow: 10,
    });

    expect(results).toBeDefined();
    const microRuns = results.samples.reduce((a, b) => a + b.microRuns, 0);
    expect(microRuns).toBeGreaterThanOrEqual(results.samples.length);
    console.log(results);
  });
});
