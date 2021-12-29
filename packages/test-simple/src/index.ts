import { SHTSequentialSimple, SHTSequentialSimpleLookup } from "js-sequential";
import { getImageData, renderSHTResults } from "./utils";
import "./style.scss";

(async () => {
  {
    const { processedData, imageData, resultsCanvas, spaceCanvas } =
      await getImageData("sht_seq", "/sudoku_threshold.jpg");

    const t1 = performance.now();
    const results = SHTSequentialSimple(processedData, {
      width: imageData.width,
      sampling: { rho: 1, theta: 0.25 },
    });
    const t2 = performance.now() - t1;
    console.log(t2);

    renderSHTResults(
      results,
      resultsCanvas,
      spaceCanvas,
      imageData.width,
      imageData.height
    );
  }
  {
    const { processedData, imageData, resultsCanvas, spaceCanvas } =
      await getImageData("sht_seq_lookup", "/sudoku_threshold.jpg");

    const t1 = performance.now();
    const results = SHTSequentialSimpleLookup(processedData, {
      width: imageData.width,
      sampling: { rho: 1, theta: 0.25 },
    });
    const t2 = performance.now() - t1;
    console.log(t2);

    renderSHTResults(
      results,
      resultsCanvas,
      spaceCanvas,
      imageData.width,
      imageData.height
    );
  }
})();
