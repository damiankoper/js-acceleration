import { asmSequentialFactory } from "wasm-sequential";
import { nodeBaseFactory } from "../common/base.node";

asmSequentialFactory()
  .init()
  .then((asmSequential) => {
    nodeBaseFactory(
      asmSequential.SHTSimple.bind(asmSequential),
      asmSequential.SHTSimpleLookup.bind(asmSequential),
      (name: string) => `../../../../../benchmark/js-asm_theta_${name}_node.csv`
    );
    return null;
  })
  .catch(() => null);
