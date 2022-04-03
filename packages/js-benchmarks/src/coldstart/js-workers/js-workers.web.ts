import { CHTSimple, SHTSimple, SHTSimpleLookup } from "js-workers";
import { webBaseFactory } from "../common/base.web";

webBaseFactory(
  CHTSimple,
  SHTSimple,
  SHTSimpleLookup,
  (name: string, env: string) => `js-workers_coldstart_${name}_${env}.csv`,
  true,
  { concurrency: 4 },
  { concurrency: 4 }
);
