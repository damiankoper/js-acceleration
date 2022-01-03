import { BenchmarkExtracted } from "../BenchmarkExtracted";

describe("Benchmark iterations extracted", () => {
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

  it("should test for loop iterations extracted", () => {
    const results = ben.runIterations({ samples: 30, microRuns: 20 });

    expect(results).toBeDefined();
    const microRuns = results.samples.reduce((a, b) => a + b.microRuns, 0);
    expect(microRuns).toBeGreaterThanOrEqual(results.samples.length + 20);
  });

  it("should test for async loop iterations extracted", async () => {
    const results = await benAsync.runIterationsAsync({
      samples: 20,
      microRuns: 5,
    });

    expect(results).toBeDefined();
    const microRuns = results.samples.reduce((a, b) => a + b.microRuns, 0);
    expect(microRuns).toBeGreaterThanOrEqual(results.samples.length);
  });

  it("should exec setup and teardown per sample", () => {
    type Global = Record<string, number>;
    const samples = 30;
    (global as unknown as Global).setupCount = 0;
    (global as unknown as Global).teardownCount = 0;
    const ben = new BenchmarkExtracted(
      function () {
        for (let index = 0; index < 2000; index++) {
          Function.prototype();
        }
      },
      function () {
        (global as unknown as Global).setupCount++;
      },
      function () {
        (global as unknown as Global).teardownCount++;
      }
    );

    const results = ben.runIterations({
      samples,
    });

    expect(results).toBeDefined();
    expect((global as unknown as Global).setupCount).toEqual(samples);
    expect((global as unknown as Global).teardownCount).toEqual(samples);
  });
});
