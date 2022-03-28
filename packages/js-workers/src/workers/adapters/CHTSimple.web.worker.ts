import { expose } from "comlink";
import {
  CHTSimpleConv2Kernel,
  CHTSimpleGradientKernel,
} from "../CHTSimple.core.worker";

expose({
  runConv2: CHTSimpleConv2Kernel,
  runGradient: CHTSimpleGradientKernel,
});

export default undefined as unknown;
