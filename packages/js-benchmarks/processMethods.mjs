/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/default */
import { readdir, readFileSync, writeFileSync, lstatSync } from "fs";
import papaparse from "papaparse";
import { join } from "path";
const testFolder = "../../benchmark/";
const resultFolder = "../../benchmark/methods";

const methodMap = new Map();

readdir(testFolder, (err, files) => {
  files
    .filter((n) => !n.startsWith("."))
    .forEach((file) => {
      const path = join(testFolder, file);
      if (!lstatSync(path).isDirectory()) {
        const str = readFileSync(path, { encoding: "utf-8" });
        const parsed = papaparse.parse(str, { header: true });
        [
          "js-sequential",
          "cpp-addon",
          "js-wasm_theta",
          "js-asm",
          "js-wasm_simd_explicit",
          "js-wasm_simd_implicit",
          "js-workers",
          "js-gpu",
        ].forEach((method) => {
          if (file.startsWith(method)) {
            const key = method + (!file.includes("Lookup") ? "" : "-lookup");
            const methodResults = methodMap.get(key) || [];
            methodMap.set(key, methodResults);
            console.log(file);
            processEnvs(file, parsed, methodResults);
          }
        });
      }
    });

  for (const [name, values] of methodMap) {
    writeFileSync(
      join(resultFolder, name + ".csv"),
      papaparse.unparse(
        values.sort((a, b) => a.name - b.name),
        { header: true }
      )
    );
  }
});

function processEnvs(file, parsed, methodResults) {
  const result = {
    name: "TBD",
    env: "TBD",
    mean: parsed.data[0].mean,
    stdev: parsed.data[0].stdev,
  };
  if (file.endsWith("node.csv")) {
    result.name = 3;
    result.env = "Node";
  } else if (file.endsWith("deno.csv")) {
    result.name = 4;
    result.env = "Deno";
  } else if (file.endsWith("Chrome.csv")) {
    result.name = 1;
    result.env = "Chrome";
  } else if (file.endsWith("Firefox.csv")) {
    result.name = 2;
    result.env = "Firefox";
  }
  methodResults.push(result);
}
