import { wasmSequential } from "wasm-sequential";
import { webBaseFactory } from "../common/base.web";

wasmSequential
  .init()
  .then(() => {
    webBaseFactory(
      wasmSequential.SHTSimple.bind(wasmSequential),
      wasmSequential.SHTSimpleLookup.bind(wasmSequential),
      (name: string, env: string) => `js-wasm_coldstart_${name}_${env}.csv`
    );
    return null;
  })
  .catch(() => null);
