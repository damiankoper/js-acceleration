import { SHTSimpleFactory } from "./SHTSimple";
import { SHTSimpleLookupFactory } from "./SHTSimpleLookup";
import SHTSimpleKernel from "./workers/SHTSimple.worker.ts";
import SHTSimpleLookupKernel from "./workers/SHTSimpleLookup.worker.ts";

export const SHTSimple = SHTSimpleFactory(() => new SHTSimpleKernel());
export const SHTSimpleLookup = SHTSimpleLookupFactory(
  () => new SHTSimpleLookupKernel()
);
