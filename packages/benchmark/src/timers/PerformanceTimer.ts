import { ITimer } from "../contracts/ITimer";

function getPerformance() {
  if (typeof window !== "undefined") return window.performance;
  else if (typeof global !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("perf_hooks").performance;
  }
}

export class PerformanceTimer implements ITimer {
  public static readonly resolution = 1e6;
  public performance?: Performance = getPerformance();
  private t = Infinity;

  public constructor() {
    if (window) this.performance = window.performance;
    else if (global && require) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.performance = require("perf_hooks").performance;
    }
  }

  public static isAvailable(): boolean {
    return !!getPerformance();
  }

  public start() {
    this.t = this.performance.now();
  }

  public stop(): number {
    return this.t - this.performance.now();
  }
}
