import { asmSequentialFactory } from "wasm-sequential";
import { nodeBaseFactory } from "../common/base.node";

console.log(asmSequentialFactory());

asmSequentialFactory()
  .init()
  .then((asmSequential) => {
    nodeBaseFactory(
      asmSequential.CHTSimple.bind(asmSequential),
      asmSequential.SHTSimple.bind(asmSequential),
      asmSequential.SHTSimpleLookup.bind(asmSequential),
      (name: string) =>
        `../../../../../benchmark/coldstart/js-asm_coldstart_${name}_node.csv`
    );
    return null;
  })
  .catch(() => null);
