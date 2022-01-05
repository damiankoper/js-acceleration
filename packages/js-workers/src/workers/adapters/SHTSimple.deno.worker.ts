import { expose } from "https://deno.land/x/importw@0.3.0/src/comlink.ts";
import { SHTSimpleKernel } from "../SHTSimple.core.worker.ts";

expose({ run: SHTSimpleKernel });
