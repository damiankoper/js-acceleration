import { expose } from "comlink";
import { CHTSimpleKernel } from "../CHTSimple.core.worker";

expose({ run: CHTSimpleKernel });

export default undefined as unknown;
