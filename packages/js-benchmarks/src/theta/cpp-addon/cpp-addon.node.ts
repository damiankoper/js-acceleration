import SHT from "node-cpp-sequential";
import { nodeBaseFactory } from "../common/base.node";

nodeBaseFactory(
  SHT.SHTSimple,
  SHT.SHTSimpleLookup,
  (name: string) => `../../../../../benchmark/cpp-addon_theta_${name}_node.csv`
);
