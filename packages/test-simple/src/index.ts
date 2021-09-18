import { SHTSequential } from "js-sequential";
import { getImageData, renderSHTResults } from "./utils";
import "./style.scss";

(async () => {
  const { processedData, imageData, resultsCanvas, spaceCanvas } =
    await getImageData("sht_seq", "/sudoku.jpg");
  const results = SHTSequential(processedData, { width: imageData.width });
  renderSHTResults(
    results,
    resultsCanvas,
    spaceCanvas,
    imageData.width,
    imageData.height
  );
})();
