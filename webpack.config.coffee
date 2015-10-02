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
      { test: /\.coffee$/, loaders: ["coffee-loader"] }
    ]

  plugins: [
    new HtmlWebpackPlugin(
      template: "tests/index.html"
      filename: "index.html"
    )
  ]

  entry:
    tests: "./tests/index.coffee"

  devtool: "eval"

  debug: true
