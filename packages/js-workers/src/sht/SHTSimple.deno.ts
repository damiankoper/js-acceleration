import {
  SHTResult,
  HTResults,
  SHTParallelOptions,
  SHTAsync,
} from "../../../meta/src/main.ts";
import { SHTSimpleKernel } from "../workers/SHTSimple.types.ts";

const pool: SHTSimpleKernel[] = [];
const SHTSimpleFactory = (createWorker: () => SHTSimpleKernel) => {
  const SHTSimple: SHTAsync = async function (
    binaryImage: Uint8Array,
    options: SHTParallelOptions
  ): Promise<HTResults<SHTResult>> {
    const results: SHTResult[] = [];
    const width = options.width;
    const height = binaryImage.length / width;

    // Defaults
    const concurrency = Math.max(options.concurrency || 1, 1);
    const sampling = Object.assign({ rho: 1, theta: 1 }, options.sampling);
    const votingThreshold = Math.max(options.votingThreshold || 0.75, 0);
    const missingWorkers = Math.max(concurrency - pool.length, 0);
    for (let i = 0; i < missingWorkers; i++) {
      pool.push(createWorker());
    }

    const hsWidth = Math.ceil(360 / sampling.theta);
    const hsHeight = Math.ceil(
      Math.sqrt(width ** 2 + height ** 2) / sampling.rho
    );

    const houghSpaceBuffer = new SharedArrayBuffer(4 * hsWidth * hsHeight);
    const houghSpace = new Uint32Array(houghSpaceBuffer);
    const sharedImageBuffer = new SharedArrayBuffer(binaryImage.byteLength);
    const sharedImage = new Uint8Array(sharedImageBuffer);
    sharedImage.set(binaryImage);

    const samplingThetaRad = (sampling.theta * Math.PI) / 180;
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
          samplingThetaRad,
          sampling.rho
        )
      );
    }
    const maxValue = Math.max(...(await Promise.all(jobs)));

    for (let hy = 0; hy < hsHeight; hy++)
      for (let hx = 0; hx < hsWidth; hx++) {
        const offset = hy * hsWidth + hx;
        if (houghSpace[offset] / maxValue > votingThreshold) {
          results.push({
            rho: hy * sampling.rho,
            theta: hx * sampling.theta,
          });
        }
      }

    return {
      results,
      hSpace: {
        data: houghSpace,
        width: hsWidth,
      },
    };
  };

  return SHTSimple;
};

export { SHTSimpleFactory };
