/* eslint-disable @typescript-eslint/no-explicit-any */
import { SHTSimpleFactory } from "./sht/SHTSimple";
import { SHTSimpleLookupFactory } from "./sht/SHTSimpleLookup";
import { Worker } from "worker_threads";
import { URL as NodeURL } from "url";
import nodeEndpoint from "comlink/dist/umd/node-adapter";

export const SHTSimple = SHTSimpleFactory(
  () =>
    nodeEndpoint(
      new Worker(
        new URL(
          "./workers/adapters/SHTSimple.node.worker.ts",
          import.meta.url
        ) as NodeURL
      ) as any
    ) as any
);

export const SHTSimpleLookup = SHTSimpleLookupFactory(
  () =>
    nodeEndpoint(
      new Worker(
        new URL(
          "./workers/adapters/SHTSimpleLookup.node.worker.ts",
          import.meta.url
        ) as NodeURL
      ) as any
    ) as any
);
