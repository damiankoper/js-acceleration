import HT from "node-cpp-sequential";
import { nodeBaseFactory } from "../common/base.node";

nodeBaseFactory(
  HT.CHTSimple,
  HT.SHTSimple,
  HT.SHTSimpleLookup,
  (name: string) =>
    `../../../../../benchmark/coldstart/cpp-addon_coldstart_${name}_node.csv`
);
