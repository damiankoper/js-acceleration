import { CHTSimple, SHTSimple, SHTSimpleLookup } from "js-workers";
import { nodeBaseFactory } from "../common/base.node";

nodeBaseFactory(
  CHTSimple,
  SHTSimple,
  SHTSimpleLookup,
  (name: string) =>
    `../../../../../benchmark/js-workers_theta_${name}_node.csv`,
  true,
  { concurrency: 4 },
  { concurrency: 4 }
);
