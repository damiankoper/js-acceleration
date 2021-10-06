export class Benchmark {
  private fn: () => void;

  constructor(fn: () => void) {
    this.fn = fn;
  }
}
