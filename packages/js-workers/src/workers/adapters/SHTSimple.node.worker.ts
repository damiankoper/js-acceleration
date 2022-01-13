import { expose } from "comlink";
import nodeEndpoint from "comlink/dist/esm/node-adapter.min.mjs";
import { parentPort } from "worker_threads";
import { SHTSimpleKernel } from "../SHTSimple.core.worker";

expose({ run: SHTSimpleKernel }, nodeEndpoint(parentPort));
