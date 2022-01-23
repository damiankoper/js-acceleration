import { wasmSequentialFactory } from "wasm-sequential";
import { webBaseFactory } from "../common/base.web";

wasmSequentialFactory()
  .init()
  .then((wasmSequential) => {
    webBaseFactory(
      wasmSequential.SHTSimple.bind(wasmSequential),
      wasmSequential.SHTSimpleLookup.bind(wasmSequential),
      (name: string, env: string) => `js-wasm_theta_${name}_${env}.csv`
    );
    return null;
  })
  .catch(() => null);
