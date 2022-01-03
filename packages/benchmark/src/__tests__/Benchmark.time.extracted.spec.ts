import { BenchmarkExtracted } from "../BenchmarkExtracted";

describe("Benchmark time extracted", () => {
  const ben = new BenchmarkExtracted(function () {
    for (let index = 0; index < 2000; index++) {
      Function.prototype();
    }
  });

  const benAsync = new BenchmarkExtracted(async function () {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 20);
    });
  });

  it("should test for loop time extracted", () => {
    const results = ben.runTimeIterations({
      minTime: 200,
      minSamples: 30,
      microRuns: 20,
    });

    expect(results).toBeDefined();
    const microRuns = results.samples.reduce((a, b) => a + b.microRuns, 0);
    expect(microRuns).toBeGreaterThanOrEqual(results.samples.length + 20);
  });

  it("should test for async loop time extracted", async () => {
    const results = await benAsync.runTimeIterationsAsync({
      minTime: 200,
      minSamples: 10,
      microRuns: 5,
    });

    expect(results).toBeDefined();
    const microRuns = results.samples.reduce((a, b) => a + b.microRuns, 0);
    expect(microRuns).toBeGreaterThanOrEqual(results.samples.length);
  });
});
