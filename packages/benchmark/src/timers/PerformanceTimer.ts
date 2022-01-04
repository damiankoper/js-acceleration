import { ITimer } from "../contracts/ITimer";
function getPerformance() {
  return performance;
}

export class PerformanceTimer implements ITimer {
  public static readonly resolution = 1e6;
  public performance?: Performance = getPerformance();
  private t = Infinity;

  public static isAvailable(): boolean {
    return !!getPerformance();
  }

  public start() {
    this.t = this.performance.now();
  }

  public stop(): number {
    return this.performance.now() - this.t;
  }
}
