import {
  SHTSimple,
  SHTSimpleLookup,
} from "../../../../js-workers/src/main.deno.ts";
import { denoBaseFactory } from "../common/base.deno.ts";

denoBaseFactory(
  SHTSimple,SHTSimpleLookup,
  (name: string) =>
    `../../../../../benchmark/coldstart/js-workers_coldstart_${name}_deno.csv`,
    true,
    { concurrency: 4 }
)
