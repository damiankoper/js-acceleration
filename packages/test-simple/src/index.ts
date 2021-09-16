import { SHTSequential, SHTResult } from "js-sequential";
import "./style.scss";

async function getImageData(prefix: string, imageName: string) {
  const resp = await fetch(imageName);
  const blob = await resp.blob();
  const jsSeqImg = document.getElementById(`${prefix}_img`) as HTMLImageElement;
  jsSeqImg.src = URL.createObjectURL(blob);
  await new Promise((resolve) => (jsSeqImg.onload = resolve));

  const canvas = document.getElementById(
    `${prefix}_canvas`
  ) as HTMLCanvasElement;

  canvas.width = jsSeqImg.width;
  canvas.height = jsSeqImg.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(jsSeqImg, 0, 0);

  const imageData = ctx.getImageData(0, 0, jsSeqImg.width, jsSeqImg.height);
  const processedData = new Uint8ClampedArray(imageData.data.length / 4);
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
    canvas,
  };
}

function renderSHTResults(
  results: SHTResult[],
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  results.push({ rho: 250, theta: 45 });
  ctx.strokeStyle = "red";
  results.forEach((result) => {
    const x = result.rho * Math.cos((result.theta * Math.PI) / 180);
    const y = result.rho * Math.sin((result.theta * Math.PI) / 180);

    const slope = -x / y;
    const intercept = y + (x * x) / y;

    ctx.lineWidth = 3;
    ctx.beginPath();
    if (intercept === Infinity) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    } else {
      ctx.moveTo(0, 0 * slope + intercept);
      ctx.lineTo(width, width * slope + intercept);
    }
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.stroke();
  });
}

(async () => {
  const { processedData, imageData, canvas } = await getImageData(
    "sht_seq",
    "/sudoku.jpg"
  );
  const results = SHTSequential(processedData, { width: imageData.width });
  renderSHTResults(
    results,
    canvas.getContext("2d"),
    imageData.width,
    imageData.height
  );
})();
