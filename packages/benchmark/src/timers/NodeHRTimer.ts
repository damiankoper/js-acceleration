import { ITimer } from "../contracts/ITimer";

export class NodeHRTimer implements ITimer {
  public static readonly resolution = 1e9;
  private t: bigint;

  public static isAvailable(): boolean {
    return typeof process === "object" && !!process?.hrtime;
  }

  public start() {
    this.t = process.hrtime.bigint();
  }

  public stop(): number {
    const t = process.hrtime.bigint();
    return Number(t - this.t) / 1e6;
  }
}
