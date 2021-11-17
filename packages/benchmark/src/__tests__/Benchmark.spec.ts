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
});
