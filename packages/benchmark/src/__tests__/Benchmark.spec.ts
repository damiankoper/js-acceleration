import { Benchmark } from "../Benchmark";

describe("Benchmark base class", () => {
  it("should init", () => {
    expect(1).toEqual(1);
  });

  it("should test for loop iterations with startup", () => {
    const ben = new Benchmark(() => {
      for (let index = 0; index < 2000; index++) {
        Function.prototype();
      }
    });

    const results = ben.runIterations({ samples: 5, count: 50 });

    expect(results).toBeDefined();
    console.log(results, ben.getSamples().length);
  });

  it("should test for loop iterations with steady state", () => {
    const ben = new Benchmark(() => {
      for (let index = 0; index < 2000; index++) {
        Function.prototype();
      }
    });

    const results = ben.runIterations({
      samples: 50,
      count: 50,
      steadyState: true,
      cov: 0.001,
      covWindow: 10,
    });

    expect(results).toBeDefined();
    console.log(results, ben.getSamples().length);
  });

  it("should test for loop time with startup", () => {
    const ben = new Benchmark(() => {
      for (let index = 0; index < 2000; index++) {
        Function.prototype();
      }
    });

    const results = ben.runTimeIterations({
      minTime: 500,
      maxTime: 2000,
      minSamples: 5,
      maxSamples: 6000,
      count: 100,
    });

    expect(results).toBeDefined();
    console.log(results, ben.getSamples().length);
  });

  it("should test for loop time with steady state", () => {
    const ben = new Benchmark(() => {
      for (let index = 0; index < 2000; index++) {
        Function.prototype();
      }
    });

    const results = ben.runTimeIterations({
      minTime: 500,
      maxTime: 2000,
      minSamples: 5,
      maxSamples: 6000,
      count: 100,
      steadyState: true,
      cov: 0.001,
      covWindow: 10,
    });

    expect(results).toBeDefined();
    console.log(results, ben.getSamples().length);
  });
});
