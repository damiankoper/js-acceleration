import { expose } from "comlink";
import nodeEndpoint from "comlink/dist/esm/node-adapter.min.mjs";
import { parentPort } from "worker_threads";
import {
  CHTSimpleConv2Kernel,
  CHTSimpleGradientKernel,
} from "../CHTSimple.core.worker";

expose(
  {
    runConv2: CHTSimpleConv2Kernel,
    runGradient: CHTSimpleGradientKernel,
  },
  nodeEndpoint(parentPort)
);
