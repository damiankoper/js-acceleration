import { SHTSimple, SHTSimpleLookup } from "js-workers";
import { webBaseFactory } from "../common/base.web";

webBaseFactory(
  SHTSimple,
  SHTSimpleLookup,
  (name: string, env: string) => `js-workers_coldstart_${name}_${env}.csv`,
  true,
  { concurrency: 4 }
);
