import { SHTSimple, SHTSimpleLookup } from "js-sequential";
import { nodeBaseFactory } from "../common/base.node";

nodeBaseFactory(
  SHTSimple,
  SHTSimpleLookup,
  (name: string) => `../../../../benchmark/js-sequential_theta_${name}_node.csv`
);
