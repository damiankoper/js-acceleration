import { SHTSimpleFactory } from "./sht/SHTSimple.deno.ts";
import { SHTSimpleLookupFactory } from "./sht/SHTSimpleLookup.deno.ts";
import { wrap } from "https://deno.land/x/importw@0.3.0/src/comlink.ts";

export const SHTSimple = SHTSimpleFactory(() =>
  wrap(
    new Worker(
      new URL(
        "./workers/adapters/SHTSimple.deno.worker.ts",
        import.meta.url
      ).href,
      { type: "module" }
    )
  )
);
export const SHTSimpleLookup = SHTSimpleLookupFactory(() =>
  wrap(
    new Worker(
      new URL(
        "./workers/adapters/SHTSimpleLookup.deno.worker.ts",
        import.meta.url
      ).href,
      { type: "module" }
    )
  )
);
