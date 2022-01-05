import { expose } from "comlink";
import { SHTSimpleLookupKernel } from "../SHTSimpleLookup.core.worker";

expose({ run: SHTSimpleLookupKernel });

export default undefined as unknown;
