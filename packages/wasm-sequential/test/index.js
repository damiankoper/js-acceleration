const factory = require('../build/a.js')

factory().then((instance) => {
  const a = new Uint32Array([1, 2])
  const aPtr = instance._malloc(a.length * a.BYTES_PER_ELEMENT);

  instance.HEAPU32.set(a, aPtr >> 2);

  const options = new Uint8Array(8 + 8 + 8 + 8);
  const dataView = new DataView(options.buffer)
  dataView.setUint32(0, 7, true); // width
  dataView.setFloat64(8, 1., true);        // sampling.rho
  dataView.setFloat64(16, 1., true);        // sampling.theta
  dataView.setFloat64(24, 0.75, true);     // votingThreshold

  const optionsPtr = instance._malloc(options.length * options.BYTES_PER_ELEMENT);
  instance.HEAP8.set(options, optionsPtr);

  // todo vector using enbind?

  console.log(instance._pppp(aPtr, optionsPtr), a, dataView)
});
