import { SHTSimple, SHTSimpleLookup } from "js-gpu";
import { webBaseFactory } from "../common/base.web";

webBaseFactory(
  SHTSimple,
  SHTSimpleLookup,
  (name: string, env: string) => `js-gpu_theta_${name}_${env}.csv`,
  true
);
