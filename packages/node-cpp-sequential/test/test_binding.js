const {
  CHTSimple,
  SHTSimple,
  SHTSimpleLookup
} = require("../dist/binding.js");
const assert = require("assert");
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

[SHTSimple, SHTSimpleLookup].forEach(fn => {

  assert(fn, "The expected function is undefined");

  function testBasic() {
    const result = fn(testImageSHT, {
      width: 7,
      votingThreshold: 13 / 14,
      returnHSpace: true
    });
    console.log(result);
    assert.equal(result.results.length, 9, "Unexpected results length");
    assert.equal(result.hSpace.width, 360, "Unexpected hough space width");
    assert.equal(result.hSpace.data.length / result.hSpace.width, 11, "Unexpected hough space height");
  }

  assert.doesNotThrow(testBasic, undefined, "testBasic threw an expection");


  function testSampling() {
    const result = fn(testImageSHT, {
      width: 7,
      votingThreshold: 13 / 14,
      sampling: {
        rho: 2,
        theta: 2
      },
      returnHSpace: true
    });
    console.log(result);

    assert.equal(result.results.length, 9, "Unexpected results length");
    assert.equal(result.hSpace.width, 360 * 2, "Unexpected hough space width");
    assert.equal(result.hSpace.data.length / result.hSpace.width, 22, "Unexpected hough space height");
  }

  assert.doesNotThrow(testSampling, undefined, "testSampling threw an expection");

});

[CHTSimple].forEach(fn => {
  assert(fn, "The expected function is undefined");

  function testBasic() {
    const result = fn(testImageCHT, {
      width: 7,
      gradientThreshold: 0.9,
      returnHSpace: true
    });
    console.log(result);
    assert.equal(result.results.length, 1, "Unexpected results length");
    assert.equal(result.hSpace.width, 7, "Unexpected hough space width");
    assert.equal(result.hSpace.data.length / result.hSpace.width, 9, "Unexpected hough space height");
  }

  assert.doesNotThrow(testBasic, undefined, "testBasic threw an expection");

})

console.log("Tests passed- everything looks OK!");
