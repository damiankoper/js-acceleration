import { ITimer } from "../contracts/ITimer";

interface Interval {
  new (): this;
  start(): void;
  stop(): void;
  microseconds(): number;
}
interface Window {
  chrome?: { Interval?: Interval };
  chromium?: { Interval?: Interval };
}

export class ChromeTimer implements ITimer {
  public static readonly resolution = 1e6;
  private interval?: Interval;

  public static isAvailable(): boolean {
    if (typeof window !== "undefined") {
      const _window = window as Window;
      return !!(_window?.chrome || _window?.chromium)?.Interval;
    }
    return false;
  }

  public start() {
    if (!this.interval) {
      const _window = window as Window;
      this.interval = new (_window.chrome || _window.chromium).Interval();
    }
    this.interval.start();
  }

  public stop(): number {
    this.interval.stop();
    return this.interval.microseconds();
  }
}
