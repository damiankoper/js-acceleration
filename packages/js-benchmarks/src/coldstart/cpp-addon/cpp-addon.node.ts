import SHT from "node-cpp-sequential";
import { nodeBaseFactory } from "../common/base.node";

nodeBaseFactory(
  SHT.SHTSimple,
  SHT.SHTSimpleLookup,
  (name: string) =>
    `../../../../../benchmark/coldstart/cpp-addon_coldstart_${name}_node.csv`
);
