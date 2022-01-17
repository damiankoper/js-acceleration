import { wasmSequentialImplicitSIMD } from "wasm-sequential";
import { nodeBaseFactory } from "../common/base.node";

wasmSequentialImplicitSIMD
  .init()
  .then(() => {
    nodeBaseFactory(
      wasmSequentialImplicitSIMD.SHTSimple.bind(wasmSequentialImplicitSIMD),
      wasmSequentialImplicitSIMD.SHTSimpleLookup.bind(
        wasmSequentialImplicitSIMD
      ),
      (name: string) =>
        `../../../../../benchmark/coldstart/js-wasm_simd_implicit_coldstart_${name}_node.csv`
    );
    return null;
  })
  .catch(() => null);