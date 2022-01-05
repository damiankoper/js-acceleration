import { SHTSimpleFactory } from "./sht/SHTSimple";
import { SHTSimpleLookupFactory } from "./sht/SHTSimpleLookup";
import SHTSimpleKernel from "./workers/adapters/SHTSimple.web.worker.ts";
import SHTSimpleLookupKernel from "./workers/adapters/SHTSimpleLookup.web.worker.ts";

export const SHTSimple = SHTSimpleFactory(() => new SHTSimpleKernel());
export const SHTSimpleLookup = SHTSimpleLookupFactory(
  () => new SHTSimpleLookupKernel()
);
