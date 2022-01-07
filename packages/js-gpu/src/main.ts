import { GPU } from "gpu.js";
const gpu = new GPU();

const hsWidth = 11;
const hsHeight = 360;
const houghSpace = gpu.createKernel(
  function (testImage: number[], width: number, height: number) {
    const rho = this.thread.y;
    const theta = this.thread.x;
    const thetaRad = (theta * Math.PI) / 180;
    // TODO: lookup version
    const cosTheta = Math.cos(thetaRad);
    const sinTheta = Math.sin(thetaRad);

    let acc = 0;
    let xc = 0;
    for (let x = 0; x < width; x++) {
      const y = Math.round((rho - xc * cosTheta) / sinTheta);
      const offset = y * height + xc;
      acc += testImage[offset];
      xc += 1;
    }
    return acc;
  },
  {
    output: [hsHeight, hsWidth],
  }
);

const width = 7;
const height = 9;

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

export function xd() {
  const result = houghSpace(testImage, width, height) as number[][];
  console.log([...result[0]].map((x) => (x > 0 ? x : "-")).join(""));
  console.log([...result[1]].map((x) => (x > 0 ? x : "-")).join(""));
  console.log([...result[2]].map((x) => (x > 0 ? x : "-")).join(""));
  console.log([...result[3]].map((x) => (x > 0 ? x : "-")).join(""));
  console.log([...result[4]].map((x) => (x > 0 ? x : "-")).join(""));
  console.log([...result[5]].map((x) => (x > 0 ? x : "-")).join(""));
  console.log([...result[6]].map((x) => (x > 0 ? x : "-")).join(""));
  console.log([...result[7]].map((x) => (x > 0 ? x : "-")).join(""));
  console.log([...result[8]].map((x) => (x > 0 ? x : "-")).join(""));
}
