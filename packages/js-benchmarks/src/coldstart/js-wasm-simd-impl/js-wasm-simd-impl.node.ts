import { wasmSequentialImplicitSIMDFactory } from "wasm-sequential";
import { nodeBaseFactory } from "../common/base.node";

wasmSequentialImplicitSIMDFactory()
  .init()
  .then((wasmSequentialImplicitSIMD) => {
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
