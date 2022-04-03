import { asmSequentialFactory } from "wasm-sequential";
import { webBaseFactory } from "../common/base.web";

asmSequentialFactory()
  .init()
  .then((asmSequential) => {
    webBaseFactory(
      asmSequential.CHTSimple.bind(asmSequential),
      asmSequential.SHTSimple.bind(asmSequential),
      asmSequential.SHTSimpleLookup.bind(asmSequential),
      (name: string, env: string) => `js-asm_theta_${name}_${env}.csv`
    );
    return null;
  })
  .catch(() => null);
