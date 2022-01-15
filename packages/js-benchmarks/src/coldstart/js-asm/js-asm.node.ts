import { asmSequential } from "wasm-sequential";
import { nodeBaseFactory } from "../common/base.node";

asmSequential
  .init()
  .then(() => {
    nodeBaseFactory(
      asmSequential.SHTSimple.bind(asmSequential),
      asmSequential.SHTSimpleLookup.bind(asmSequential),
      (name: string) =>
        `../../../../../benchmark/coldstart/js-asm_coldstart_${name}_node.csv`
    );
    return null;
  })
  .catch(() => null);
