import { expose } from "comlink";
import { parentPort } from "worker_threads";
import nodeEndpoint from "comlink/dist/esm/node-adapter.min.mjs";
import { SHTSimpleLookupKernel } from "../SHTSimpleLookup.core.worker";

expose({ run: SHTSimpleLookupKernel }, nodeEndpoint(parentPort));
