import { BenchmarkExtracted } from "../BenchmarkExtracted";

describe("Benchmark time extracted", () => {
  const ben = new BenchmarkExtracted(function () {
    for (let index = 0; index < 2000; index++) {
      Function.prototype();
    }
  });

  it("should test for loop time extracted", () => {
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
});
