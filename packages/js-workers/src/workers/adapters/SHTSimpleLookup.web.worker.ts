import { expose } from "comlink";
import { SHTSimpleLookupKernel } from "../SHTSimpleLookup.core.worker";
console.log(expose, SHTSimpleLookupKernel);

expose({ run: SHTSimpleLookupKernel });

export default undefined as unknown;
