import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

export default {
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js'
  },

  resolve: {
    root: [path.join(__dirname, 'src')],
    extensions: ['', '.js'],
    moduleDirectories: ['node_modules']
  },

  resolveLoader: {
    moduleDirectories: ['node_modules']
  },

  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loaders: ['babel']},
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'test/index.html',
      filename: 'index.html'
    })
  ],

  entry: {
    tests: './test/index.js'
  },

  devtool: 'sourcemap',

  debug: true
}
