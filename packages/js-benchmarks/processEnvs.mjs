/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/default */
import { readdir, readFileSync, writeFileSync, lstatSync } from "fs";
import papaparse from "papaparse";
import * as ss from "simple-statistics";
import { join } from "path";
const testFolder = "../../benchmark/";
const resultFolder = "../../benchmark/environments";

const methodMap = new Map();

const methods = [
  "js-sequential",
  "cpp-addon",
  "js-wasm_theta",
  "js-asm",
  "js-wasm_simd_explicit",
  "js-wasm_simd_implicit",
  "js-workers",
  "js-gpu",
];

readdir(testFolder, (err, files) => {
  files
    .filter((n) => !n.startsWith("."))
    .forEach((file) => {
      const path = join(testFolder, file);
      if (!lstatSync(path).isDirectory()) {
        const str = readFileSync(path, { encoding: "utf-8" });
        const parsed = papaparse.parse(str, { header: true });
        methods.forEach((method) => {
          if (file.startsWith(method)) {
            const lookup = file.includes("Lookup");
            const key = method + (!lookup ? "" : "-lookup");
            const methodResults = methodMap.get(key) || {
              name: mapMethodName(method, lookup),
              chrome: "-",
              chromeF: "1.00",
              firefox: "-",
              firefoxF: 1,
              node: "-",
              nodeF: 1,
              deno: "-",
              denoF: 1,
            };
            methodMap.set(key, methodResults);
            processEnvs(file, parsed, methodResults);
          }
        });
      }
    });

  const chromeFs = [];
  const firefoxFs = [];
  const nodeFs = [];
  const denoFs = [];

  [...methodMap.values()].forEach((method) => {
    method.nodeF = method.node / method.chrome || "-";
    method.firefoxF = method.firefox / method.chrome || "-";
    method.denoF = method.deno / method.chrome || "-";
    if (typeof method.nodeF === "number") {
      nodeFs.push(method.nodeF);
      method.nodeF = method.nodeF.toFixed(2);
    }
    if (typeof method.firefoxF === "number") {
      firefoxFs.push(method.firefoxF);
      method.firefoxF = method.firefoxF.toFixed(2);
    }
    if (typeof method.denoF === "number") {
      denoFs.push(method.denoF);
      method.denoF = method.denoF.toFixed(2);
    }
    if (method.chrome === "-") {
      chromeFs.push(method.chromeF);
      method.chromeF = "-";
    }
  });

  writeFileSync(
    join(resultFolder, "geoMeans" + ".csv"),
    papaparse.unparse(
      [
        {
          chrome: ss.geometricMean(chromeFs).toFixed(2),
          firefox: ss.geometricMean(firefoxFs).toFixed(2),
          node: ss.geometricMean(nodeFs).toFixed(2),
          deno: ss.geometricMean(denoFs).toFixed(2),
        },
      ],
      { header: true }
    )
  );

  writeFileSync(
    join(resultFolder, "envs" + ".csv"),
    papaparse.unparse([...methodMap.values()], { header: true })
  );
});

function mapMethodName(name, lookup) {
  switch (name) {
    case "js-sequential":
      return !lookup ? "JS Sequential" : "JS Sequential (lookup)";
    case "cpp-addon":
      return !lookup ? "C++ addon" : "C++ addon (lookup)";
    case "js-wasm_theta":
      return !lookup ? "WASM" : "WASM (lookup)";
    case "js-asm":
      return !lookup ? "Asm.js" : "Asm.js (lookup)";
    case "js-wasm_simd_explicit":
      return !lookup ? "WASM SIMD (expl.)" : "WASM SIMD (expl.\\comma lookup)";
    case "js-wasm_simd_implicit":
      return !lookup ? "WASM SIMD (impl.)" : "WASM SIMD (impl.\\comma lookup)";
    case "js-workers":
      return !lookup ? "Workers" : "Workers (lookup)";
    case "js-gpu":
      return !lookup ? "WebGL" : "WebGL (lookup)";
    default:
      return "NA";
  }
}

function processEnvs(file, parsed, methodResults) {
  if (file.endsWith("node.csv")) {
    methodResults.node = Number(parsed.data[0].mean).toFixed(0);
  } else if (file.endsWith("deno.csv")) {
    methodResults.deno = Number(parsed.data[0].mean).toFixed(0);
  } else if (file.endsWith("Chrome.csv")) {
    methodResults.chrome = Number(parsed.data[0].mean).toFixed(0);
  } else if (file.endsWith("Firefox.csv")) {
    methodResults.firefox = Number(parsed.data[0].mean).toFixed(0);
  }
}
