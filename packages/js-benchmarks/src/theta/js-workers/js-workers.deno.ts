import {
  CHTSimple,
  SHTSimple,
  SHTSimpleLookup,
} from "../../../../js-workers/src/main.deno.ts";
import { denoBaseFactory } from "../common/base.deno.ts";

denoBaseFactory(
  CHTSimple,
  SHTSimple,
  SHTSimpleLookup,
  (name: string) =>
    `../../../../../benchmark/js-workers_theta_${name}_deno.csv`,
  true,
  { concurrency: 4 },
  { concurrency: 4 }
);
