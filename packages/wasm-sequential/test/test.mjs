import {
  wasmSequentialFactory,
  wasmSequentialImplicitSIMDFactory,
  wasmSequentialSIMDFactory,
} from "../dist/main.mjs";

function* unpackVector(vector) {
  for (let i = 0; i < vector.size(); i++) {
    yield vector.get(i);
  }
}

/* eslint-disable prettier/prettier */
const testImageSHT = new Uint8Array([
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
const testImageCHT = new Uint8Array([
  0, 0, 0, 0, 0, 0, 0, //
  0, 0, 0, 0, 0, 0, 0, //
  0, 0, 1, 1, 1, 0, 0, //
  0, 1, 1, 0, 1, 1, 0, //
  0, 1, 0, 0, 0, 1, 0, //
  0, 1, 1, 0, 1, 1, 0, //
  0, 0, 1, 1, 1, 0, 0, //
  0, 0, 0, 0, 0, 0, 0, //
  0, 0, 0, 0, 0, 0, 0, //
]);
/* eslint-enable prettier/prettier */

const optionsSHT = {
  width: 7,
  sampling: {
    rho: 1,
    theta: 1,
  },
  votingThreshold: 13 / 14,
};
const optionsCHT = {
  width: 7,
  gradientThreshold: 0.9,
}

wasmSequentialFactory()
  .init()
  .then((instance) => {

    let t = performance.now();
    instance.CHTSimple(testImageCHT, optionsCHT);
    console.log("CHTSimple:".padEnd(38), performance.now() - t);

    t = performance.now();
    instance.SHTSimple(testImageSHT, optionsSHT);
    console.log("SHTSimple:".padEnd(38), performance.now() - t);

    t = performance.now();
    instance.SHTSimpleLookup(testImageSHT, optionsSHT);
    console.log("SHTSimpleLookup:".padEnd(38), performance.now() - t);

    return null;
  })
  .catch(console.log);

wasmSequentialImplicitSIMDFactory()
  .init()
  .then((instance) => {
    let t = performance.now();
    let results = instance.SHTSimple(testImageSHT, optionsSHT);
    //console.log("SHTSimpleImplicitSIMD:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    console.log("SHTSimpleImplicitSIMD:".padEnd(38), performance.now() - t);
    results.results.delete();
    results.hSpace.data.delete();

    t = performance.now();
    results = instance.SHTSimpleLookup(testImageSHT, optionsSHT);
    //console.log("SHTSimpleLookupImplicitSIMD:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    console.log(
      "SHTSimpleLookupImplicitSIMD:".padEnd(38),
      performance.now() - t
    );

    return null;
  })
  .catch(() => null);

wasmSequentialSIMDFactory()
  .init()
  .then((instance) => {
    let t = performance.now();
    let results = instance.SHTSimple(testImageSHT, optionsSHT);
    console.log("SHTSimpleSIMD:".padEnd(38), performance.now() - t);

    //console.log("SHTSimpleSIMD:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])

    t = performance.now();
    results = instance.SHTSimpleLookup(testImageSHT, optionsSHT);
    console.log("SHTSimpleLookupSIMD:".padEnd(38), performance.now() - t);
    //console.log("SHTSimpleLookupSIMD:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    return null;
  })
  .catch(() => null);
