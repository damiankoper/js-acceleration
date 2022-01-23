import factorySIMD from "../build/wasmSequentialSIMD.mjs";
import factoryImplicitSIMD from "../build/wasmSequentialImplicitSIMD.mjs";
import { wasmSequential } from "../dist/main.mjs";
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
const w = wasmSequential();
w.init()
  .then(() => {
    let t = performance.now();
    w.SHTSimple(testImage, options);
    //console.log("SHTSimple:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    console.log("SHTSimple:".padEnd(38), performance.now() - t);

    t = performance.now();
    w.SHTSimpleLookup(testImage, options);
    //console.log("SHTSimpleLookup:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    console.log("SHTSimpleLookup:".padEnd(38), performance.now() - t);

    return null;
  })
  .catch(console.log);

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

    return null;
  })
  .then(factorySIMD)
  .then((instance) => {
    let t = performance.now();
    let results = instance.SHTSimple(testImage, options);
    console.log("SHTSimpleSIMD:".padEnd(38), performance.now() - t);

    //console.log("SHTSimpleSIMD:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])

    t = performance.now();
    results = instance.SHTSimpleLookup(testImage, options);
    console.log("SHTSimpleLookupSIMD:".padEnd(38), performance.now() - t);
    //console.log("SHTSimpleLookupSIMD:".padEnd(38), results.results.size())
    //console.log([...unpackVector(results.results)])
    return null;
  })
  .catch(() => null);
