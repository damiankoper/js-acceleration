import { expose } from "https://deno.land/x/importw@0.3.0/src/comlink.ts";
import { SHTSimpleLookupKernel } from "../SHTSimpleLookup.core.worker.ts";

expose({ run: SHTSimpleLookupKernel });
