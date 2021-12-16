import { BenchmarkExtracted } from "../BenchmarkExtracted";

describe("Benchmark iterations extracted", () => {
  const ben = new BenchmarkExtracted(function () {
    for (let index = 0; index < 2000; index++) {
      Function.prototype();
    }
  });

  it("should test for loop iterations extracted", () => {
    const results = ben.runIterations({ samples: 50, microRuns: 100 });

    expect(results).toBeDefined();
    console.log(results, results.mean / 1000, ben.getSamples().length);
  });
});
