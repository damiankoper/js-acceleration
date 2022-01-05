import { expose } from "comlink";
import nodeEndpoint from "comlink/dist/umd/node-adapter";
import { parentPort } from "worker_threads";
import { SHTSimpleKernel } from "../SHTSimple.core.worker";

expose({ run: SHTSimpleKernel }, nodeEndpoint(parentPort));
