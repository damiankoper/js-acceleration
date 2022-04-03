import { expose } from "https://deno.land/x/importw@0.3.0/src/comlink.ts";
import {
  CHTSimpleConv2Kernel,
  CHTSimpleGradientKernel,
} from "../CHTSimple.core.worker.ts";

expose({
  runConv2: CHTSimpleConv2Kernel,
  runGradient: CHTSimpleGradientKernel,
});
