import {
  SHTResult,
  HTResults,
  SHTParallelOptions,
  SHTParallelAsync,
} from "meta";
import { SHTSimpleLookupKernel } from "../workers/SHTSimpleLookup.types";
import { wrap, Remote } from "comlink";

const pool: Remote<SHTSimpleLookupKernel>[] = [];
const SHTSimpleLookupFactory = (createWorker: () => Worker) => {
  const SHTSimpleLookup: SHTParallelAsync = async function (
    binaryImage: Uint8Array,
    options: SHTParallelOptions
  ): Promise<HTResults<SHTResult>> {
    const results: SHTResult[] = [];
    const width = options.width;
    const height = binaryImage.length / width;

    // Defaults
    const concurrency = Math.max(options.concurrency || 1, 1);
    const sampling = Object.assign({ rho: 1, theta: 1 }, options.sampling);
    const votingThreshold = options.votingThreshold || 0.75;
    const missingWorkers = Math.max(concurrency - pool.length, 0);
    for (let i = 0; i < missingWorkers; i++) {
      pool.push(wrap(createWorker()));
    }

    const hsWidth = Math.trunc(360 * sampling.theta);
    const hsHeight = Math.trunc(
      Math.sqrt(width ** 2 + height ** 2) * sampling.rho
    );

    const houghSpaceBuffer = new SharedArrayBuffer(4 * hsWidth * hsHeight);
    const houghSpace = new Uint32Array(houghSpaceBuffer);
    const sharedImageBuffer = new SharedArrayBuffer(binaryImage.byteLength);
    const sharedImage = new Uint8Array(sharedImageBuffer);
    sharedImage.set(binaryImage);

    const sinLookupBuffer = new SharedArrayBuffer(4 * hsWidth);
    const cosLookupBuffer = new SharedArrayBuffer(4 * hsWidth);
    const sinLookup = new Float32Array(sinLookupBuffer);
    const cosLookup = new Float32Array(cosLookupBuffer);

    const samplingThetaRad = Math.PI / 180 / sampling.theta;
    for (let i = 0; i < hsWidth; i++) {
      sinLookup[i] = Math.sin(i * samplingThetaRad);
      cosLookup[i] = Math.cos(i * samplingThetaRad);
    }

    const jobs: Promise<number>[] = [];
    const batch = Math.ceil(hsWidth / concurrency);
    for (let i = 0; i < concurrency; i++) {
      const hxFrom = i * batch;
      const hxTo = i + 1 == concurrency ? hsWidth : (i + 1) * batch;
      jobs.push(
        pool[i].run(
          hxFrom,
          hxTo,
          width,
          height,
          sharedImage,
          hsWidth,
          houghSpace,
          sampling.rho,
          sinLookup,
          cosLookup
        )
      );
    }
    const maxValue = Math.max(...(await Promise.all(jobs)));

    for (let hy = 0; hy < hsHeight; hy++)
      for (let hx = 0; hx < hsWidth; hx++) {
        const offset = hy * hsWidth + hx;
        if (houghSpace[offset] / maxValue > votingThreshold) {
          results.push({
            rho: hy / sampling.rho,
            theta: hx / sampling.theta,
          });
        }
      }

    return {
      results,
      hSpace: options.returnHSpace
        ? {
            data: houghSpace,
            width: hsWidth,
          }
        : undefined,
    };
  };

  return SHTSimpleLookup;
};

export { SHTSimpleLookupFactory };
