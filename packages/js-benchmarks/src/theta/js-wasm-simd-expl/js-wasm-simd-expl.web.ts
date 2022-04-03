import { wasmSequentialSIMDFactory } from "wasm-sequential";
import { webBaseFactory } from "../common/base.web";

wasmSequentialSIMDFactory()
  .init()
  .then((wasmSequentialSIMD) => {
    webBaseFactory(
      wasmSequentialSIMD.CHTSimple.bind(wasmSequentialSIMD),
      wasmSequentialSIMD.SHTSimple.bind(wasmSequentialSIMD),
      wasmSequentialSIMD.SHTSimpleLookup.bind(wasmSequentialSIMD),
      (name: string, env: string) =>
        `js-wasm_simd_explicit_theta_${name}_${env}.csv`
    );
    return null;
  })
  .catch(() => null);
