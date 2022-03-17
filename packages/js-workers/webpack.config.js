/* eslint-disable @typescript-eslint/no-var-requires */
// Generated using webpack-cli https://github.com/webpack/webpack-cli

import { resolve, dirname } from "path";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isProduction = process.env.NODE_ENV === "production";

const config = () => ({
  entry: {},
  devtool: "cheap-module-source-map",
  output: {
    filename: "[name].mjs",
    path: resolve(__dirname, "dist"),
    library: {
      type: "module",
    },
    environment: { module: true },
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        build: true,
        mode: "write-dts",
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
        options: {
          // disable type checker - we will use it in fork plugin
          transpileOnly: true,
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  experiments: { outputModule: true },
  externalsType: "module",
  optimization: {
    minimize: false,
  },
});

export default [
  () => {
    const c = config();
    c.mode = isProduction ? "production" : "development";
    c.entry["main.web"] = "./src/main.web.ts";
    c.target = "web";

    c.module.rules.unshift({
      test: /\.web\.worker\.(js|ts)$/,
      loader: "worker-loader",
      options: {
        inline: "no-fallback",
      },
    });
    return c;
  },
  () => {
    const c = config();
    c.mode = isProduction ? "production" : "development";
    c.entry["main.node"] = "./src/main.node.ts";
    c.target = "node";
    c.output.chunkFormat = "module";
    c.externals = [/^(comlink|\$)$/i]

    return c;
  },
];
