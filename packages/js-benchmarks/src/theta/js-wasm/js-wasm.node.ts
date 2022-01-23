import { wasmSequentialFactory } from "wasm-sequential";
import { nodeBaseFactory } from "../common/base.node";

wasmSequentialFactory()
  .init()
  .then((wasmSequential) => {
    nodeBaseFactory(
      wasmSequential.SHTSimple.bind(wasmSequential),
      wasmSequential.SHTSimpleLookup.bind(wasmSequential),
      (name: string) =>
        `../../../../../benchmark/js-wasm_theta_${name}_node.csv`
    );
    return null;
  })
  .catch(() => null);
