import {
  SHTSimple,
  SHTSimpleLookup,
} from "../../../../js-sequential/dist/main.mjs";
import { denoBaseFactory } from "../common/base.deno.ts";

denoBaseFactory(
  SHTSimple,SHTSimpleLookup,
  (name: string) =>
      `../../../../../benchmark/js-sequential_theta_${name}_deno.csv`
)
