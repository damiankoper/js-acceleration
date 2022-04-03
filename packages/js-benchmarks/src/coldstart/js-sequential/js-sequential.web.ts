import { CHTSimple, SHTSimple, SHTSimpleLookup } from "js-sequential";
import { webBaseFactory } from "../common/base.web";

webBaseFactory(
  CHTSimple,
  SHTSimple,
  SHTSimpleLookup,
  (name: string, env: string) => `js-sequential_coldstart_${name}_${env}.csv`
);
