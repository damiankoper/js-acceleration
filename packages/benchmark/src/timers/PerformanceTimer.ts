import { ITimer } from "../contracts/ITimer";

export class PerformanceTimer implements ITimer {
  public static readonly resolution = 1e6;
  private t = Infinity;

  public static isAvailable(): boolean {
    return !!performance;
  }

  public start() {
    this.t = performance.now();
  }

  public stop(): number {
    return this.t - performance.now();
  }
}
