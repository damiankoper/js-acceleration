import { HTResults, SHTResult } from "meta";

export async function getImageData(prefix: string, imageName: string) {
  const resp = await fetch(imageName);
  const blob = await resp.blob();
  const jsSeqImg = document.getElementById(`${prefix}_img`) as HTMLImageElement;
  jsSeqImg.src = URL.createObjectURL(blob);
  await new Promise((resolve) => (jsSeqImg.onload = resolve));

  const resultsCanvas = document.getElementById(
    `${prefix}_canvas`
  ) as HTMLCanvasElement;

  const spaceCanvas = document.getElementById(
    `${prefix}_canvas_hspace`
  ) as HTMLCanvasElement;

  resultsCanvas.width = jsSeqImg.width;
  resultsCanvas.height = jsSeqImg.height;
  const ctx = resultsCanvas.getContext("2d");

  ctx.drawImage(jsSeqImg, 0, 0);

  const imageData = ctx.getImageData(0, 0, jsSeqImg.width, jsSeqImg.height);
  const processedData = new Uint8Array(imageData.data.length / 4);
  for (let i = 0; i < imageData.data.length; i++) {
    processedData[i] = Math.round(
      Math.max(
        imageData.data[i * 4],
        imageData.data[i * 4 + 1],
        imageData.data[i * 4 + 2]
      ) / 255
    );
  }

  return {
    processedData,
    imageData,
    resultsCanvas,
    spaceCanvas,
  };
}

export function renderSHTResults(
  results: HTResults<SHTResult>,
  resultsCanvas: HTMLCanvasElement,
  spaceCanvas: HTMLCanvasElement,
  width: number,
  height: number
) {
  const resultCtx = resultsCanvas.getContext("2d");
  results.results.forEach((result) => {
    resultCtx.strokeStyle = "red";
    const x = result.rho * Math.cos((result.theta * Math.PI) / 180);
    const y = result.rho * Math.sin((result.theta * Math.PI) / 180);

    const slope = -x / y;
    const intercept = y + (x * x) / y;

    resultCtx.lineWidth = 3;
    resultCtx.beginPath();
    if (intercept === Infinity) {
      resultCtx.moveTo(x, 0);
      resultCtx.lineTo(x, height);
    } else {
      resultCtx.moveTo(0, 0 * slope + intercept);
      resultCtx.lineTo(width, width * slope + intercept);
    }
    resultCtx.stroke();
    resultCtx.strokeStyle = "green";

    resultCtx.lineWidth = 1;
    resultCtx.beginPath();
    resultCtx.moveTo(0, 0);
    resultCtx.lineTo(x, y);
    resultCtx.stroke();
  });

  if (results.hSpace && results.hSpace.data) {
    const spaceCtx = spaceCanvas.getContext("2d");
    const width = results.hSpace.width;
    const height = results.hSpace.data.length / results.hSpace.width;
    spaceCanvas.width = width;
    spaceCanvas.height = height;

    const data = Array.from(results.hSpace.data);
    let max = -Infinity;
    data.forEach((element) => {
      if (max < element) max = element;
    });
    const normalized = data.map((n) => (n / max) * 255);

    if (height) {
      const imageData = spaceCtx.createImageData(width, height);
      for (let i = 0; i < normalized.length; i++) {
        imageData.data[i * 4] = normalized[i]; // R
        imageData.data[i * 4 + 1] = normalized[i]; // G
        imageData.data[i * 4 + 2] = normalized[i]; // B
        imageData.data[i * 4 + 3] = 255; // A
      }
      spaceCtx.putImageData(imageData, 0, 0);
    }
  }
}
