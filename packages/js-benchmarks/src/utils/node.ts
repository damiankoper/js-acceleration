import Jimp from "jimp";

export async function getImageData(path: string) {
  const img = await Jimp.read(path);
  const data = new Uint8Array(img.bitmap.data);
  const imageData = new Uint8Array(data.length / 4);

  for (let i = 0; i < data.length; i++) {
    imageData[i] = data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2] > 0 ? 1 : 0;
  }

  return { imageData, width: img.bitmap.width };
}
