import { wasmSequentialFactory } from "wasm-sequential";
import { nodeBaseFactory } from "../common/base.node";

wasmSequentialFactory()
  .init()
  .then((wasmSequential) => {
    nodeBaseFactory(
      wasmSequential.SHTSimple.bind(wasmSequential),
      wasmSequential.SHTSimpleLookup.bind(wasmSequential),
      (name: string) =>
        `../../../../../benchmark/coldstart/js-wasm_coldstart_${name}_node.csv`
    );
    return null;
  })
  .catch(() => null);
