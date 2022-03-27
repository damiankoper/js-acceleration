import { expose } from "comlink";
import nodeEndpoint from "comlink/dist/esm/node-adapter.min.mjs";
import { parentPort } from "worker_threads";
import { CHTSimpleKernel } from "../CHTSimple.core.worker";

expose({ run: CHTSimpleKernel }, nodeEndpoint(parentPort));
