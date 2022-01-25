import { asmSequentialFactory } from "wasm-sequential";
import { webBaseFactory } from "../common/base.web";

asmSequentialFactory()
  .init()
  .then((asmSequential) => {
    webBaseFactory(
      asmSequential.SHTSimple.bind(asmSequential),
      asmSequential.SHTSimpleLookup.bind(asmSequential),
      (name: string, env: string) => `js-asm_coldstart_${name}_${env}.csv`
    );
    return null;
  })
  .catch(() => null);
