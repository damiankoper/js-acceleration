import { wasmSequentialImplicitSIMDFactory } from "wasm-sequential";
import { webBaseFactory } from "../common/base.web";

wasmSequentialImplicitSIMDFactory()
  .init()
  .then((wasmSequentialImplicitSIMD) => {
    webBaseFactory(
      wasmSequentialImplicitSIMD.SHTSimple.bind(wasmSequentialImplicitSIMD),
      wasmSequentialImplicitSIMD.SHTSimpleLookup.bind(
        wasmSequentialImplicitSIMD
      ),
      (name: string, env: string) =>
        `js-wasm_simd_implicit_coldstart_${name}_${env}.csv`
    );
    return null;
  })
  .catch(() => null);
