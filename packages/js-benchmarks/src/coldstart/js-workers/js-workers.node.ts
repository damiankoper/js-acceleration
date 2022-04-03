import { CHTSimple, SHTSimple, SHTSimpleLookup } from "js-workers";
import { nodeBaseFactory } from "../common/base.node";

nodeBaseFactory(
  CHTSimple,
  SHTSimple,
  SHTSimpleLookup,
  (name: string) =>
    `../../../../../benchmark/coldstart/js-workers_coldstart_${name}_node.csv`,
  true,
  { concurrency: 4 },
  { concurrency: 4 }
);
