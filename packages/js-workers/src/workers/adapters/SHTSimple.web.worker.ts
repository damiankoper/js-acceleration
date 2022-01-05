import { expose } from "comlink";
import { SHTSimpleKernel } from "../SHTSimple.core.worker";

expose({ run: SHTSimpleKernel });

export default undefined as unknown;
