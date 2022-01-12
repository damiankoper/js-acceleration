import decode from "https://deno.land/x/wasm_image_decoder@v0.0.4/mod.js";

export async function getImageData(path: string) {
  const decoded = decode((await Deno.readFile(path)).buffer);

  const data = decoded.data;
  const imageData = new Uint8Array(data.length / 4);

  for (let i = 0; i < data.length; i++) {
    imageData[i] = data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2] > 0 ? 1 : 0;
  }

  return { imageData, width: decoded.width };
}
