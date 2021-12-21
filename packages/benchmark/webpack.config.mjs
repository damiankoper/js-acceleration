/* eslint-disable @typescript-eslint/no-var-requires */
// Generated using webpack-cli https://github.com/webpack/webpack-cli

import { resolve, dirname } from "path";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isProduction = process.env.NODE_ENV === "production";

const config = {
  entry: "./src/main.ts",
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
          transpileOnly: false,
          configFile: resolve(__dirname, "./tsconfig.build.json"),
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      perf_hooks: false,
    },
  },

  experiments: { outputModule: true },
  externalsType: "module",
  externals: {
    perf_hooks: "perf_hooks",
    "simple-statistics": "simple-statistics",
    "strongly-typed-events": "strongly-typed-events",
  },
  optimization: {
    minimize: false,
  },
};

export default () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
