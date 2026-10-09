import path from "node:path";
import { fileURLToPath } from "node:url";
import HtmlWebpackPlugin from "html-webpack-plugin";

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export default {
  entry: "./src/js/index.js",
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
  output: {
    filename: "main.js",
    path: path.resolve(_dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(svg|ttf|woff|woff2|eot|otf)$/i,
        type: "asset/resource",
      },
    ],
  },
};
