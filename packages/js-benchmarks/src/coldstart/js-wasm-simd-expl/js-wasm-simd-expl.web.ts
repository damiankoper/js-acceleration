import { wasmSequentialSIMD } from "wasm-sequential";
import { webBaseFactory } from "../common/base.web";

wasmSequentialSIMD
  .init()
  .then(() => {
    webBaseFactory(
      wasmSequentialSIMD.SHTSimple.bind(wasmSequentialSIMD),
      wasmSequentialSIMD.SHTSimpleLookup.bind(wasmSequentialSIMD),
      (name: string, env: string) =>
        `js-wasm_simd_explicit_theta_${name}_${env}.csv`
    );
    return null;
  })
  .catch(() => null);
