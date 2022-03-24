import {
  CHT,
  CHTOptions,
  CHTResult,
  HTResults,
  SHT,
  SHTOptions,
  SHTResult,
} from "meta";
import factory from "../build/wasmSequential.mjs";
import factoryImplicitSIMD from "../build/wasmSequentialImplicitSIMD.mjs";
import factorySIMD from "../build/wasmSequentialSIMD.mjs";
import factoryAsm from "../build/asmSequential.mjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function* unpackVector<T>(vector: any): Generator<T, void, unknown> {
  for (let i = 0; i < vector.size(); i++) {
    yield vector.get(i);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModuleFactory = (Module?: any) => Promise<any>;

interface Module {
  CHTSimple: CHT;
  SHTSimple: SHT;
  SHTSimpleLookup: SHT;
}

export class WasmWrapper implements Module {
  readonly defaultSHTOptions: Partial<SHTOptions> = {
    sampling: { rho: 1, theta: 1 },
    votingThreshold: 0.75,
    returnHSpace: false,
  };
  readonly defaultCHTOptions: Partial<CHTOptions> = {
    gradientThreshold: 0.75,
    returnHSpace: false,
    maxR: 100,
    minDist: 100,
    minR: 10,
  };

  public moduleRaw: Module | null;
  moduleFactory: ModuleFactory;
  constructor(moduleFactory: ModuleFactory) {
    this.moduleFactory = moduleFactory;
  }

  public async init() {
    this.moduleRaw = await this.moduleFactory();
    return this;
  }

  public CHTSimple(
    binaryImage: Uint8Array,
    options: CHTOptions
  ): HTResults<CHTResult> {
    const module = this.validate();
    const results = module.CHTSimple(
      binaryImage,
      this.mergeDefaultCHTOptions(options)
    );
    return this.transformResults(results);
  }

  public SHTSimple(
    binaryImage: Uint8Array,
    options: SHTOptions
  ): HTResults<SHTResult> {
    const module = this.validate();
    const results = module.SHTSimple(
      binaryImage,
      this.mergeDefaultSHTOptions(options)
    );
    return this.transformResults(results);
  }

  public SHTSimpleLookup(
    binaryImage: Uint8Array,
    options: SHTOptions
  ): HTResults<SHTResult> {
    const module = this.validate();
    const results = module.SHTSimpleLookup(
      binaryImage,
      this.mergeDefaultSHTOptions(options)
    );
    return this.transformResults(results);
  }

  public validate(): Module {
    if (this.moduleRaw) {
      return this.moduleRaw;
    } else
      throw new Error(
        "WASM module not initiated. Run WasmWrapper.init() method."
      );
  }

  public transformResults<HTResult>(
    results: HTResults<HTResult>
  ): HTResults<HTResult> {
    const r = {
      results: [...unpackVector<HTResult>(results.results)],
      hSpace: {
        data: new Uint32Array(unpackVector<number>(results.hSpace.data)),
        width: results.hSpace.width,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (results.results as any).delete();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (results.hSpace.data as any).delete();

    return r;
  }

  public mergeDefaultSHTOptions(options: SHTOptions): SHTOptions {
    return {
      width: options.width,
      sampling: {
        ...this.defaultSHTOptions.sampling,
        ...options.sampling,
      },
      votingThreshold:
        options.votingThreshold || this.defaultSHTOptions.votingThreshold,
      returnHSpace:
        options.returnHSpace !== undefined
          ? options.returnHSpace
          : this.defaultSHTOptions.returnHSpace,
    };
  }

  public mergeDefaultCHTOptions(options: CHTOptions): CHTOptions {
    return {
      width: options.width,
      returnHSpace:
        options.returnHSpace !== undefined
          ? options.returnHSpace
          : this.defaultCHTOptions.returnHSpace,
      gradientThreshold:
        options.gradientThreshold || this.defaultCHTOptions.gradientThreshold,
      minDist: options.minDist || this.defaultCHTOptions.minDist,
      minR: options.minR || this.defaultCHTOptions.minR,
      maxR: options.maxR || this.defaultCHTOptions.maxR,
    };
  }
}

export const wasmSequentialFactory = () => new WasmWrapper(factory);
export const wasmSequentialImplicitSIMDFactory = () =>
  new WasmWrapper(factoryImplicitSIMD);
export const wasmSequentialSIMDFactory = () => new WasmWrapper(factorySIMD);
export const asmSequentialFactory = () => new WasmWrapper(factoryAsm);
