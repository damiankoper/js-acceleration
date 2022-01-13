import { wasmSequentialImplicitSIMD } from "wasm-sequential";
import { webBaseFactory } from "../common/base.web";

wasmSequentialImplicitSIMD
  .init()
  .then(() => {
    webBaseFactory(
      wasmSequentialImplicitSIMD.SHTSimple.bind(wasmSequentialImplicitSIMD),
      wasmSequentialImplicitSIMD.SHTSimpleLookup.bind(
        wasmSequentialImplicitSIMD
      ),
      (name: string, env: string) =>
        `js-wasm_simd_implicit_theta_${name}_${env}.csv`
    );
    return null;
  })
  .catch(() => null);
