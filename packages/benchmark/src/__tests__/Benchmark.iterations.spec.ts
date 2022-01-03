import { Benchmark } from "../Benchmark";

describe("Benchmark iterations", () => {
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

  it("should test for loop iterations with startup", () => {
    const results = ben.runIterations({ samples: 30, microRuns: 20 });

    expect(results).toBeDefined();
    const microRuns = results.samples.reduce((a, b) => a + b.microRuns, 0);
    expect(microRuns).toBeGreaterThanOrEqual(results.samples.length + 20);
  });

  it("should test for async loop iterations with startup", async () => {
    const results = await benAsync.runIterationsAsync({
      samples: 20,
      microRuns: 5,
    });

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

  it("should test for async loop iterations with steady state", async () => {
    const results = await benAsync.runIterationsAsync({
      samples: 20,
      microRuns: 5,
      steadyState: true,
      cov: 0.01,
      covWindow: 5,
    });

    expect(results).toBeDefined();
    const microRuns = results.samples.reduce((a, b) => a + b.microRuns, 0);
    expect(microRuns).toBeGreaterThanOrEqual(results.samples.length + 20);
  });

  it("should exec setup and teardown per sample", () => {
    const samples = 30;
    let setupCount = 0;
    let teardownCount = 0;
    const ben = new Benchmark(
      function () {
        for (let index = 0; index < 2000; index++) {
          Function.prototype();
        }
      },
      function () {
        setupCount++;
      },
      function () {
        teardownCount++;
      }
    );

    const results = ben.runIterations({
      samples,
    });

    expect(results).toBeDefined();
    expect(setupCount).toEqual(samples);
    expect(teardownCount).toEqual(samples);
  });
});
