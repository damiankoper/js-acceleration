import { SHTSimple, SHTSimpleLookup } from "js-sequential";
import { webBaseFactory } from "../common/base.sync.web";

webBaseFactory(
  SHTSimple,
  SHTSimpleLookup,
  (name: string, env: string) => `js-sequential_theta_${name}_${env}.csv`
);
