import { wasmSequentialSIMDFactory } from "wasm-sequential";
import { nodeBaseFactory } from "../common/base.node";

wasmSequentialSIMDFactory()
  .init()
  .then((wasmSequentialSIMD) => {
    nodeBaseFactory(
      wasmSequentialSIMD.SHTSimple.bind(wasmSequentialSIMD),
      wasmSequentialSIMD.SHTSimpleLookup.bind(wasmSequentialSIMD),
      (name: string) =>
        `../../../../../benchmark/js-wasm_simd_explicit_theta_${name}_node.csv`
    );
    return null;
  })
  .catch(() => null);
