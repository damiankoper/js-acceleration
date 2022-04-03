import {
  CHTSimple,
  SHTSimple,
  SHTSimpleLookup,
} from "../../../../js-sequential/dist/main.mjs";
import { denoBaseFactory } from "../common/base.deno.ts";

denoBaseFactory(
  CHTSimple,
  SHTSimple,
  SHTSimpleLookup,
  (name: string) =>
    `../../../../../benchmark/coldstart/js-sequential_coldstart_${name}_deno.csv`
);
