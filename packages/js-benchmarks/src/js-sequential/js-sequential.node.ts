import { SHTSimple, SHTSimpleLookup } from "js-sequential";
import { nodeBaseFactory } from "../common/base.sync.node";

nodeBaseFactory(
  SHTSimple,
  SHTSimpleLookup,
  (name: string) => `../../../../benchmark/js-sequential_theta_${name}_node.csv`
);
