/* eslint-disable @typescript-eslint/no-var-requires */
// Generated using webpack-cli https://github.com/webpack/webpack-cli

import { resolve, dirname } from "path";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isProduction = process.env.NODE_ENV === "production";

const config = () => ({
  entry: {},
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
      eslint: {
        files: "./src/**/*.{ts,tsx,js,jsx}", // required - same as command `eslint ./src/**/*.{ts,tsx,js,jsx} --ext .ts,.tsx,.js,.jsx`
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
          transpileOnly: false,
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

    return c;
  },
];
