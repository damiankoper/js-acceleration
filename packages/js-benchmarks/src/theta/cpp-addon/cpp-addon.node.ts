import HT from "node-cpp-sequential";
import { nodeBaseFactory } from "../common/base.node";

nodeBaseFactory(
  HT.CHTSimple,
  HT.SHTSimple,
  HT.SHTSimpleLookup,
  (name: string) => `../../../../../benchmark/cpp-addon_theta_${name}_node.csv`
);
