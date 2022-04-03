import { CHTSimple, SHTSimple, SHTSimpleLookup } from "js-sequential";
import { nodeBaseFactory } from "../common/base.node";

nodeBaseFactory(
  CHTSimple,
  SHTSimple,
  SHTSimpleLookup,
  (name: string) =>
    `../../../../../benchmark/coldstart/js-sequential_coldstart_${name}_node.csv`
);
