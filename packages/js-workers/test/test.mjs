import { SHTSimple /* , SHTSimpleLookup */ } from "../dist/main.mjs";

/* eslint-disable prettier/prettier */
const testImage = new Uint8Array([
    0, 0, 0, 0, 0, 0, 0, //
    0, 0, 0, 0, 0, 0, 0, //
    0, 0, 0, 0, 0, 0, 0, //
    0, 0, 0, 0, 0, 0, 0, //
    1, 1, 1, 1, 1, 1, 1, //
    0, 0, 0, 0, 0, 0, 0, //
    0, 0, 0, 0, 0, 0, 0, //
    0, 0, 0, 0, 0, 0, 0, //
    0, 0, 0, 0, 0, 0, 0, //
  ]);
  /* eslint-enable prettier/prettier */

const options = {
  width: 7,
  sampling: { rho: 1, theta: 1 },
  votingThreshold: 13 / 14,
};

SHTSimple(testImage, options);
