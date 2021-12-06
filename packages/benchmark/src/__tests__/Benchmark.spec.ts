import { Benchmark } from "../Benchmark";

describe("Benchmark base class", () => {
  it("should init", () => {
    expect(1).toEqual(1);
  });

  it("should test for loop iterations", () => {
    const ben = new Benchmark(() => {
      for (let index = 0; index < 2000; index++) {
        Function.prototype();
      }
    });

    const results = ben.runIterations({ samples: 5, count: 50 });

    expect(results).toBeDefined();
    console.log(results);
  });

  it("should test for loop time", () => {
    const ben = new Benchmark(() => {
      for (let index = 0; index < 200; index++) {
        Function.prototype();
      }
    });

    const results = ben.runTimeIterations({
      minTime: 500,
      maxTime: 2000,
      minSamples: 5,
      maxSamples: 6000,
      count: 6,
    });

    expect(results).toBeDefined();
    console.log(
      results,
      ben.getSamples().reduce((a, b) => a + b.totalTime, 0),
      ben.getSamples().length
    );
  });
});
