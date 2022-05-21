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
            const alg = path.includes("SHT") ? "SHT" : "CHT";
            const lookup = file.includes("Lookup");
            const key = alg + method + (!lookup ? "" : "-lookup");
            const methodResults = methodMap.get(key) || {
              alg,
              lookup: lookup ? "\\cmark" : "",
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

  const chromeFs_cht = [];
  const chromeFs_nonlookup = [];
  const chromeFs_lookup = [];
  const firefoxFs_cht = [];
  const firefoxFs_nonlookup = [];
  const firefoxFs_lookup = [];
  const nodeFs_cht = [];
  const nodeFs_nonlookup = [];
  const nodeFs_lookup = [];
  const denoFs_cht = [];
  const denoFs_nonlookup = [];
  const denoFs_lookup = [];

  [...methodMap.values()].forEach((method) => {
    method.nodeF = method.node / method.chrome || "-";
    method.firefoxF = method.firefox / method.chrome || "-";
    method.denoF = method.deno / method.chrome || "-";
    if (typeof method.nodeF === "number") {
      if (method.alg == "CHT" && method.name != "WebGL")
        nodeFs_cht.push(method.nodeF);
      else if (method.lookup) nodeFs_lookup.push(method.nodeF);
      else nodeFs_nonlookup.push(method.nodeF);
      method.nodeF = method.nodeF.toFixed(2);
    }
    if (typeof method.firefoxF === "number") {
      if (method.alg == "CHT" && method.name != "WebGL")
        firefoxFs_cht.push(method.firefoxF);
      else if (method.lookup) firefoxFs_lookup.push(method.firefoxF);
      else firefoxFs_nonlookup.push(method.firefoxF);
      method.firefoxF = method.firefoxF.toFixed(2);
    }
    if (typeof method.denoF === "number") {
      if (method.alg == "CHT" && method.name != "WebGL")
        denoFs_cht.push(method.denoF);
      else if (method.lookup) denoFs_lookup.push(method.denoF);
      else denoFs_nonlookup.push(method.denoF);
      method.denoF = method.denoF.toFixed(2);
    }
    if (method.chrome === "-") {
      if (method.alg == "CHT" && method.name != "WebGL")
        chromeFs_cht.push(method.chromeF);
      else if (method.lookup) chromeFs_lookup.push(method.chromeF);
      else chromeFs_nonlookup.push(method.chromeF);
      method.chromeF = "-";
    }
  });

  writeFileSync(
    join(resultFolder, "geoMeans" + ".csv"),
    papaparse.unparse(
      [
        {
          lookup: "",
          name: "Średnia geometryczna (CHT)",
          chrome: ss.geometricMean(chromeFs_cht).toFixed(2),
          firefox: ss.geometricMean(firefoxFs_cht).toFixed(2),
          node: ss.geometricMean(nodeFs_cht).toFixed(2),
          deno: ss.geometricMean(denoFs_cht).toFixed(2),
        },
        {
          lookup: "",
          name: "Średnia geometryczna (SHT \\textit{non-LUT})",
          chrome: ss.geometricMean(chromeFs_nonlookup).toFixed(2),
          firefox: ss.geometricMean(firefoxFs_nonlookup).toFixed(2),
          node: ss.geometricMean(nodeFs_nonlookup).toFixed(2),
          deno: ss.geometricMean(denoFs_nonlookup).toFixed(2),
        },
        {
          lookup: "",
          name: "Średnia geometryczna (SHT \\textit{LUT})",
          chrome: ss.geometricMean(chromeFs_lookup).toFixed(2),
          firefox: ss.geometricMean(firefoxFs_lookup).toFixed(2),
          node: ss.geometricMean(nodeFs_lookup).toFixed(2),
          deno: ss.geometricMean(denoFs_lookup).toFixed(2),
        },
        {
          lookup: "",
          name: "Średnia geometryczna (wszystkie)",
          chrome: ss
            .geometricMean([
              ...chromeFs_lookup,
              ...chromeFs_nonlookup,
              ...chromeFs_cht,
            ])
            .toFixed(2),
          firefox: ss
            .geometricMean([
              ...firefoxFs_lookup,
              ...firefoxFs_nonlookup,
              ...firefoxFs_cht,
            ])
            .toFixed(2),
          node: ss
            .geometricMean([
              ...nodeFs_lookup,
              ...nodeFs_nonlookup,
              ...nodeFs_cht,
            ])
            .toFixed(2),
          deno: ss
            .geometricMean([
              ...denoFs_lookup,
              ...denoFs_nonlookup,
              ...denoFs_cht,
            ])
            .toFixed(2),
        },
      ],
      { header: true }
    )
  );
  const order = [
    "JS Sequential",
    "C++ addon",
    "asm.js",
    "WASM",
    "WASM SIMD (impl.)",
    "WASM SIMD (expl.)",
    "Workers",
    "WebGL",
  ];
  writeFileSync(
    join(resultFolder, "envs" + ".csv"),
    papaparse.unparse(
      [...methodMap.values()]
        .sort((a, b) => {
          const startsWithA = order.reduce(
            (o, str, i) => (a.name.startsWith(str) ? i : o),
            0
          );
          const startsWithB = order.reduce(
            (o, str, i) => (b.name.startsWith(str) ? i : o),
            0
          );
          const x = Math.sign(startsWithA - startsWithB);

          // XD
          return a.alg == "CHT" && b.alg == "SHT"
            ? -1
            : a.alg == "SHT" && b.alg == "CHT"
            ? 1
            : a.lookup && !b.lookup
            ? 1
            : !a.lookup && b.lookup
            ? -1
            : x;
        })
        .map((v) => {
          if (v.name.startsWith("asm.js")) {
            v.chrome = `\\textcolor{red}{${v.chrome}}`;
            v.firefox = `\\textcolor{red}{${v.firefox}}`;
            v.node = `\\textcolor{red}{${v.node}}`;
          }
          if (v.name.startsWith("WASM SIMD (expl.)")) {
            v.chrome = `\\textcolor{orange}{${v.chrome}}`;
            v.firefox = `\\textcolor{orange}{${v.firefox}}`;
            v.node = `\\textcolor{orange}{${v.node}}`;
          }
          if (v.name.startsWith("C++")) {
            v.node = `\\textcolor{green!70!black}{${v.node}}`;
          }
          if (v.name.startsWith("WebGL") && v.alg == "SHT") {
            v.chrome = `\\textbf{\\textcolor{green!70!black}{${v.chrome}}}`;
          } else if (v.name.startsWith("WebGL") && v.alg == "CHT") {
            v.chrome = `\\textcolor{gray}{${v.chrome}}`;
            v.firefox = `\\textcolor{gray}{${v.firefox}}`;
          }
          return v;
        }),
      { header: true }
    )
  );
});

function mapMethodName(name, lookup) {
  switch (name) {
    case "js-sequential":
      return !lookup ? "JS Sequential" : "JS Sequential";
    case "cpp-addon":
      return !lookup ? "C++ addon" : "C++ addon";
    case "js-wasm_theta":
      return !lookup ? "WASM" : "WASM";
    case "js-asm":
      return !lookup ? "asm.js" : "asm.js";
    case "js-wasm_simd_explicit":
      return !lookup ? "WASM SIMD (expl.)" : "WASM SIMD (expl.)";
    case "js-wasm_simd_implicit":
      return !lookup ? "WASM SIMD (impl.)" : "WASM SIMD (impl.)";
    case "js-workers":
      return !lookup ? "Workers" : "Workers";
    case "js-gpu":
      return !lookup ? "WebGL" : "WebGL";
    default:
      return "NA";
  }
}

function processEnvs(file, parsed, methodResults) {
  if (file.endsWith("node.csv")) {
    if (file.includes("CHT"))
      methodResults.node = Number(parsed.data[9].mean).toFixed(2);
    else methodResults.node = Number(parsed.data[0].mean).toFixed(0);
  } else if (file.endsWith("deno.csv")) {
    if (file.includes("CHT"))
      methodResults.deno = Number(parsed.data[9].mean).toFixed(2);
    else methodResults.deno = Number(parsed.data[0].mean).toFixed(0);
  } else if (file.endsWith("Chrome.csv")) {
    if (file.includes("CHT"))
      methodResults.chrome = Number(parsed.data[9].mean).toFixed(2);
    else methodResults.chrome = Number(parsed.data[0].mean).toFixed(0);
  } else if (file.endsWith("Firefox.csv")) {
    if (file.includes("CHT"))
      methodResults.firefox = Number(parsed.data[9].mean).toFixed(2);
    else methodResults.firefox = Number(parsed.data[0].mean).toFixed(0);
  }
}
