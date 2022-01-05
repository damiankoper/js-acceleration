const { SHTSimple, SHTSimpleLookup } = require("../dist/binding.js");
const assert = require("assert");
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

[SHTSimple,SHTSimpleLookup].forEach(fn => {

  assert(fn, "The expected function is undefined");

  function testBasic() {
    const result = fn(testImage, { width: 7, votingThreshold: 13 / 14 });

    assert.equal(result.results.length, 9, "Unexpected results length");
    assert.equal(result.hSpace.width, 360, "Unexpected hough space width");
    assert.equal(result.hSpace.data.length / result.hSpace.width, 12, "Unexpected hough space height");
  }

  assert.doesNotThrow(testBasic, undefined, "testBasic threw an expection");


  function testSampling() {
    const result = fn(testImage, { width: 7, votingThreshold: 13 / 14, sampling: { rho: 0.5, theta: 0.5 } });

    assert.equal(result.results.length, 9, "Unexpected results length");
    assert.equal(result.hSpace.width, 360 * 2, "Unexpected hough space width");
    assert.equal(result.hSpace.data.length / result.hSpace.width, 23, "Unexpected hough space height");
  }

  assert.doesNotThrow(testSampling, undefined, "testSampling threw an expection");

})


console.log("Tests passed- everything looks OK!");
