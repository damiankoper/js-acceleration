import factorySIMD from "../build/wasmSequentialSIMD.mjs";
import factory from "../build/wasmSequential.mjs";
import factoryImplicitSIMD from "../build/wasmSequentialImplicitSIMD.mjs";

function* unpackVector(vector) {
  for (let i = 0; i < vector.size(); i++) {
    yield vector.get(i);
  }
}

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

factory()
  .then((instance) => {
    /*     instance.SHTSimple(testImage, options)
  instance.SHTSimple(testImage, options)
  instance.SHTSimple(testImage, options) */

    let t = performance.now();
    let results = instance.SHTSimple(testImage, options);
    //console.log("SHTSimple:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    console.log("SHTSimple:".padEnd(38), performance.now() - t);
    results.results.delete();
    results.hSpace.data.delete();

    t = performance.now();
    results = instance.SHTSimpleLookup(testImage, options);
    //console.log("SHTSimpleLookup:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    console.log("SHTSimpleLookup:".padEnd(38), performance.now() - t);
    results.results.delete();
    results.hSpace.data.delete();

    return null;
  })
  .catch(() => null);

factoryImplicitSIMD()
  .then((instance) => {
    let t = performance.now();
    let results = instance.SHTSimple(testImage, options);
    //console.log("SHTSimpleImplicitSIMD:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    console.log("SHTSimpleImplicitSIMD:".padEnd(38), performance.now() - t);
    results.results.delete();
    results.hSpace.data.delete();

    t = performance.now();
    results = instance.SHTSimpleLookup(testImage, options);
    //console.log("SHTSimpleLookupImplicitSIMD:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    console.log(
      "SHTSimpleLookupImplicitSIMD:".padEnd(38),
      performance.now() - t
    );
    results.results.delete();
    results.hSpace.data.delete();

    return null;
  })
  .then(factorySIMD)
  .then((instance) => {
    let t = performance.now();
    let results = instance.SHTSimple(testImage, options);
    console.log("SHTSimpleSIMD:".padEnd(38), performance.now() - t);

    //console.log("SHTSimpleSIMD:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    results.results.delete();
    results.hSpace.data.delete();

    t = performance.now();
    results = instance.SHTSimpleLookup(testImage, options);
    console.log("SHTSimpleLookupSIMD:".padEnd(38), performance.now() - t);
    //console.log("SHTSimpleLookupSIMD:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    results.results.delete();
    results.hSpace.data.delete();
    return null;
  })
  .catch(() => null);
