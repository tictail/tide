path = require "path"
HtmlWebpackPlugin = require "html-webpack-plugin"

module.exports =
  output:
    path: path.join(__dirname, "build")
    filename: "[name].js"

  resolve:
    root: [path.join(__dirname, 'src')]
    extensions: ["", ".js", ".coffee"]
    moduleDirectories: ["node_modules"]

  resolveLoader:
    moduleDirectories: ["node_modules"]

  module:
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loaders: ["babel"]}
      {test: /\.coffee$/, loaders: ["coffee"]}
    ]

  plugins: [
    new HtmlWebpackPlugin(
      template: "test/index.html"
      filename: "index.html"
    )
  ]

  entry:
    tests: "./test/index.coffee"

  devtool: "eval"

  debug: true
