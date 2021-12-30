const factory = require('../build/a.js')

factory().then((instance) => {
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
  let t = performance.now()
  let results = instance.SHTSequentialSimple(testImage, { width: 7, sampling: { rho: 1, theta: 1 }, votingThreshold: 13 / 14 })
  console.log(results.results.size())
  console.log(performance.now() - t);

  t = performance.now()
  results = instance.SHTSequentialSimpleLookup(testImage, { width: 7, sampling: { rho: 1, theta: 1 }, votingThreshold: 13 / 14 })
  console.log(results.results.size())
  console.log(performance.now() - t);
});
