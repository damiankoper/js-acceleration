import { ITimer } from "../contracts/ITimer";

export class NodeHRTimer implements ITimer {
  public static readonly resolution = 1e9;
  private t: [number, number] = [0, 0];

  public static isAvailable(): boolean {
    return typeof process === "object" && !!process?.hrtime;
  }

  public start() {
    this.t = process.hrtime();
  }

  public stop(): number {
    const t = process.hrtime(this.t);
    return t[0] * 1e3 + t[1] / 1e6;
  }
}
