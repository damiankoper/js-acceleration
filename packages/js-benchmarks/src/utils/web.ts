export async function getImageData(path: string) {
  const resp = await fetch(path);
  const blob = await resp.blob();
  const jsSeqImg = new Image();
  jsSeqImg.src = URL.createObjectURL(blob);
  await new Promise((resolve) => (jsSeqImg.onload = resolve));

  const canvas = document.createElement(`canvas`);

  canvas.width = jsSeqImg.width;
  canvas.height = jsSeqImg.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(jsSeqImg, 0, 0);

  const imageDataRaw = ctx.getImageData(0, 0, jsSeqImg.width, jsSeqImg.height);
  const imageData = new Uint8Array(imageDataRaw.data.length / 4);
  for (let i = 0; i < imageDataRaw.data.length; i++) {
    imageData[i] = Math.round(
      Math.max(
        imageDataRaw.data[i * 4],
        imageDataRaw.data[i * 4 + 1],
        imageDataRaw.data[i * 4 + 2]
      ) / 255
    );
  }

  return {
    imageData,
    width: canvas.width,
  };
}
