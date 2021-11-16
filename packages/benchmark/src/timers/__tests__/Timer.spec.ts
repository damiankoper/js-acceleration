import { NodeHRTimer } from "../NodeHRTimer";
import { ChromeTimer } from "../ChromeTimer";
import { PerformanceTimer } from "../PerformanceTimer";

describe("Timer tests", () => {
  test("PerformanceTimer is available everywhere", () => {
    expect(PerformanceTimer.isAvailable()).toBeTruthy();
  });

  test("NodeHRTimer is defined in Node", () => {
    expect(NodeHRTimer.isAvailable()).toBeTruthy();
  });

  test("ChromeTimer is not defined in Node", () => {
    expect(ChromeTimer.isAvailable()).toBeFalsy();
  });
});
