/* eslint-disable @typescript-eslint/no-var-requires */
const factorySIMD = require("../build/wasmSequentialSIMD.cjs");
const factory = require("../build/wasmSequential.cjs");
const factoryImplicitSIMD = require("../build/wasmSequentialImplicitSIMD.cjs");

function* unpackVector(vector) {
  for (let i = 0; i < vector.size(); i++) {
    yield vector.get(i);
  }
}

/* eslint-disable prettier/prettier */
const testImage = new Int8Array([
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
console.log(factory);
factory()
  .then((instance) => {
    /*     instance.SHTSequentialSimple(testImage, options)
  instance.SHTSequentialSimple(testImage, options)
  instance.SHTSequentialSimple(testImage, options) */

    let t = performance.now();
    let results = instance.SHTSequentialSimple(testImage, options);
    //console.log("SHTSequentialSimple:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    console.log("SHTSequentialSimple:".padEnd(38), performance.now() - t);
    results.results.delete();
    results.hSpace.data.delete();

    t = performance.now();
    results = instance.SHTSequentialSimpleLookup(testImage, options);
    //console.log("SHTSequentialSimpleLookup:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    console.log("SHTSequentialSimpleLookup:".padEnd(38), performance.now() - t);
    results.results.delete();
    results.hSpace.data.delete();

    return null;
  })
  .then(factoryImplicitSIMD)
  .then((instance) => {
    let t = performance.now();
    let results = instance.SHTSequentialSimple(testImage, options);
    //console.log("SHTSequentialSimpleImplicitSIMD:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    console.log(
      "SHTSequentialSimpleImplicitSIMD:".padEnd(38),
      performance.now() - t
    );
    results.results.delete();
    results.hSpace.data.delete();

    t = performance.now();
    results = instance.SHTSequentialSimpleLookup(testImage, options);
    //console.log("SHTSequentialSimpleLookupImplicitSIMD:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    console.log(
      "SHTSequentialSimpleLookupImplicitSIMD:".padEnd(38),
      performance.now() - t
    );
    results.results.delete();
    results.hSpace.data.delete();

    return null;
  })
  .then(factorySIMD)
  .then((instance) => {
    let t = performance.now();
    let results = instance.SHTSequentialSimple(testImage, options);
    console.log("SHTSequentialSimpleSIMD:".padEnd(38), performance.now() - t);

    //console.log("SHTSequentialSimpleSIMD:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    results.results.delete();
    results.hSpace.data.delete();

    t = performance.now();
    results = instance.SHTSequentialSimpleLookup(testImage, options);
    console.log(
      "SHTSequentialSimpleLookupSIMD:".padEnd(38),
      performance.now() - t
    );
    //console.log("SHTSequentialSimpleLookupSIMD:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    results.results.delete();
    results.hSpace.data.delete();
    return null;
  })
  .catch(() => null);
