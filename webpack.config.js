// @ts-check

// @ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig * */

/** @type WebpackConfig */
/* const extensionConfig = {
  target: "node", // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: "./src/extension.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
  },
  externals: {
    vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vsceignore file
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".js", ".html"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        test: /\.html$/i,
        loader: "raw-loader",
      },
    ],
  },
  devtool: "nosources-source-map",
};
module.exports = [extensionConfig]; */

const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { DefinePlugin } = require("webpack");
const path = require("path");

const makeConfig = (argv, {
  entry, out, target, library = "commonjs",
}) => ({
  mode: argv.mode,
  devtool: argv.mode === "production" ? false : "inline-source-map",
  entry,
  target,
  output: {
    path: path.join(__dirname, path.dirname(out)),
    filename: path.basename(out),
    publicPath: "",
    libraryTarget: library,
    chunkFormat: library,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
  },
  externals: {
    vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  experiments: {
    outputModule: true,
  },
  module: {
    rules: [
      // Allow importing ts(x) files:
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          configFile: path.join(path.dirname(entry), "tsconfig.json"),
          // transpileOnly enables hot-module-replacement
          transpileOnly: true,
          compilerOptions: {
            // Overwrite the noEmit from the client's tsconfig
            noEmit: false,
          },
        },
      },
      // Allow importing CSS modules:
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
        ],
      },
      {
        test: /\.ttf/,
        type: "asset/inline",
      },
      /* {
        test: /\.wasm/,
        type: "asset/source",
      }, */
      {
        test: /\.wasm$/,
        use: "uint8array-loader",
      },
      {
        test: /\.html$/i,
        loader: "raw-loader",
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.join(path.dirname(entry), "tsconfig.json"),
      },
    }),
    new DefinePlugin({
      // Path from the output filename to the output directory
      __webpack_relative_entrypoint_to_root__: JSON.stringify(
        path.posix.relative(path.posix.dirname("/index.js"), "/"),
      ),
      scriptUrl: "import.meta.url",
    }),
  ],
});

module.exports = (env, argv) => [
  makeConfig(argv, {
    entry: "./src/notebook/index.tsx",
    out: "./dist/notebook.js",
    target: "web",
    library: "module",
  }),
  makeConfig(argv, {
    entry: "./src/extension.ts",
    out: "./dist/extension.js",
    target: "node",
  }),
  /* makeConfig(argv, {
    entry: "./src/extension/extension.ts",
    out: "./out/extension/extension.web.js",
    target: "webworker",
  }), */
];
