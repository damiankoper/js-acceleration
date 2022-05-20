/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/default */
import { readdir, readFileSync, writeFileSync } from "fs";
import papaparse from "papaparse";
import { join } from "path";
const testFolder = "../../benchmark/coldstart/";

readdir(testFolder, (err, files) => {
  files
    .filter((n) => !n.startsWith("."))
    .forEach((file) => {
      console.log(file);
      const str = readFileSync(join(testFolder, file), { encoding: "utf-8" });
      const parsed = papaparse.parse(str, { header: true });
      const max = parsed.data[0].time;
      parsed.data.forEach((data) => {
        data.time /= max;
      });
      writeFileSync(join(testFolder, file), papaparse.unparse(parsed.data));
    });
});
