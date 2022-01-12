/* eslint-disable @typescript-eslint/no-var-requires */
// Generated using webpack-cli https://github.com/webpack/webpack-cli

import { resolve, dirname } from "path";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isProduction = process.env.NODE_ENV === "production";

const config = () => ({
  mode: isProduction ? "production" : "development",
  devtool: "cheap-module-source-map",
  output: {
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
      typescript: {
        build: true,
        mode: "write-dts",
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
        options: {
          // disable type checker - we will use it in fork plugin
          transpileOnly: true,
        },
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  externals: [/^(jimp|\$)$/i],
  experiments: { outputModule: true },
});

export default [
  () => {
    const c = config();
    c.entry = {
      "js-sequential": "./src/js-sequential/js-sequential.node.ts",
    };
    c.output.chunkFormat = "module";
    c.output.filename = "[name].node.mjs";
    c.target = "node";
    return c;
  },
  () => {
    const c = config();
    c.entry = {
      "js-sequential": "./src/js-sequential/js-sequential.web.ts",
    };
    c.output.filename = "[name].web.mjs";
    c.target = "web";
    c.plugins.push(
      new HtmlWebpackPlugin({
        filename: "[name].web.html",
        scriptLoading: "module",
      })
    );
    return c;
  },
];
