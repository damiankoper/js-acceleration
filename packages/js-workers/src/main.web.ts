import { CHTSimpleFactory } from "./cht/CHTSimple";
import { SHTSimpleFactory } from "./sht/SHTSimple";
import { SHTSimpleLookupFactory } from "./sht/SHTSimpleLookup";
import CHTSimpleKernel from "./workers/adapters/CHTSimple.web.worker.ts";
import SHTSimpleKernel from "./workers/adapters/SHTSimple.web.worker.ts";
import SHTSimpleLookupKernel from "./workers/adapters/SHTSimpleLookup.web.worker.ts";

export const SHTSimple = SHTSimpleFactory(() => new SHTSimpleKernel());
export const SHTSimpleLookup = SHTSimpleLookupFactory(
  () => new SHTSimpleLookupKernel()
);
export const CHTSimple = CHTSimpleFactory(() => new CHTSimpleKernel());
