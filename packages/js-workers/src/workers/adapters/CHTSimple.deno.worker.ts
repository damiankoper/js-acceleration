import { expose } from "https://deno.land/x/importw@0.3.0/src/comlink.ts";
import { CHTSimpleKernel } from "../CHTSimple.core.worker.ts";

expose({ run: CHTSimpleKernel });
