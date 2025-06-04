module.exports = {
  entry: "./src/main.ts",
  module: {
    rules: require("./webpack.rules"),
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
  externals: {
    "@abandonware/noble": "commonjs2 @abandonware/noble",
    serialport: "commonjs2 serialport",
  },
};
