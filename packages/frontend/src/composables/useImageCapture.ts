import { ShallowRef, shallowRef } from "vue";

export function useImageCapture(width?: number, height?: number) {
  const imageCapture: ShallowRef<ImageCapture | null> = shallowRef(null);
  let stream: MediaStream | null = null;
  async function init(
    constraints: MediaStreamConstraints = {
      video: {
        width: { exact: width || 1280 },
        height: { exact: height || 720 },
      },
      audio: false,
    }
  ) {
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      const track = stream.getVideoTracks()[0];
      if (track) {
        imageCapture.value = new ImageCapture(track);
      } else {
        console.error("The stream does not contain any video track!");
      }
    } catch (err) {
      console.error(err);
    }
  }

  function destroy() {
    imageCapture.value = null;
  }

  return { init, destroy, imageCapture, stream };
}
