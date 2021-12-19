import { BenchmarkExtracted } from "../BenchmarkExtracted";

describe("Benchmark iterations extracted", () => {
  const ben = new BenchmarkExtracted(function () {
    for (let index = 0; index < 2000; index++) {
      Function.prototype();
    }
  });

  it("should test for loop iterations extracted", () => {
    const results = ben.runIterations({ samples: 30, microRuns: 20 });

    expect(results).toBeDefined();
    const microRuns = results.samples.reduce((a, b) => a + b.microRuns, 0);
    expect(microRuns).toBeGreaterThanOrEqual(results.samples.length + 20);
  });
});
