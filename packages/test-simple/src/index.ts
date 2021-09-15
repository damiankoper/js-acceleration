import { SHTSequential } from "js-sequential";
import "./style.scss";

(async () => {
  const resp = await fetch("/sudoku.jpg");
  const blob = await resp.blob();
  const jsSeqImg = document.getElementById("sht_seq_img") as HTMLImageElement;
  jsSeqImg.src = URL.createObjectURL(blob);
  await new Promise((resolve) => setTimeout(resolve, 100));

  const canvas = document.getElementById("sht_seq_canvas") as HTMLCanvasElement;
  canvas.width = jsSeqImg.width;
  canvas.height = jsSeqImg.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(jsSeqImg, 0, 0);
  const data = ctx.getImageData(0, 0, jsSeqImg.width, jsSeqImg.height).data;

  console.log(data);
  SHTSequential(data, { width: jsSeqImg.width });
})();
