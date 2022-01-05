import { HTResults, SHT, SHTOptions, SHTResult } from "meta";
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
  SHTSimple: SHT;
  SHTSimpleLookup: SHT;
}

export class WasmWrapper implements Module {
  readonly defaultSHTOptions: Partial<SHTOptions> = {
    sampling: { rho: 1, theta: 1 },
    votingThreshold: 0.75,
  };

  public moduleRaw: Module | null;
  moduleFactory: ModuleFactory;
  constructor(moduleFactory: ModuleFactory) {
    this.moduleFactory = moduleFactory;
  }

  public async init() {
    this.moduleRaw = await this.moduleFactory();
  }

  public SHTSimple(
    binaryImage: Uint8Array,
    options: SHTOptions
  ): HTResults<SHTResult> {
    const module = this.valdate();
    const results = module.SHTSimple(
      binaryImage,
      this.mergeDefaultOptions(options)
    );
    return this.transformResults(results);
  }

  public SHTSimpleLookup(
    binaryImage: Uint8Array,
    options: SHTOptions
  ): HTResults<SHTResult> {
    const module = this.valdate();
    const results = module.SHTSimpleLookup(
      binaryImage,
      this.mergeDefaultOptions(options)
    );
    return this.transformResults(results);
  }

  private valdate(): Module {
    if (this.moduleRaw) {
      return this.moduleRaw;
    } else
      throw new Error(
        "WASM module not initiated. Run WasmWrapper.init() method."
      );
  }

  private transformResults(results: HTResults<SHTResult>) {
    return {
      results: [...unpackVector<SHTResult>(results.results)],
      hSpace: {
        data: new Uint32Array(unpackVector<number>(results.hSpace.data)),
        width: results.hSpace.width,
      },
    };
  }

  private mergeDefaultOptions(options: SHTOptions): SHTOptions {
    return {
      width: options.width,
      sampling: {
        ...this.defaultSHTOptions.sampling,
        ...options.sampling,
      },
      votingThreshold:
        options.votingThreshold || this.defaultSHTOptions.votingThreshold,
    };
  }
}

export const wasmSequential = new WasmWrapper(factory);
export const wasmSequentialImplicitSIMD = new WasmWrapper(factoryImplicitSIMD);
export const wasmSequentialSIMD = new WasmWrapper(factorySIMD);
export const asmSequential = new WasmWrapper(factoryAsm);
