import { expose } from "comlink";
import { parentPort } from "worker_threads";
import nodeEndpoint from "comlink/dist/umd/node-adapter";
import { SHTSimpleLookupKernel } from "../SHTSimpleLookup.core.worker";

expose({ run: SHTSimpleLookupKernel }, nodeEndpoint(parentPort));
