import { wasmSequential } from "wasm-sequential";
import { nodeBaseFactory } from "../common/base.node";

wasmSequential
  .init()
  .then(() => {
    nodeBaseFactory(
      wasmSequential.SHTSimple.bind(wasmSequential),
      wasmSequential.SHTSimpleLookup.bind(wasmSequential),
      (name: string) =>
        `../../../../../benchmark/coldstart/js-wasm_coldstart_${name}_node.csv`
    );
    return null;
  })
  .catch(() => null);
