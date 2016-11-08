import path from 'path'
import webpack from 'webpack'
import autoprefixer from 'autoprefixer'
import HtmlWebpackPlugin from 'html-webpack-plugin'

module.exports = {
  resolveLoader: {
    moduleDirectories: ['node_modules'],
    fallback: path.join(__dirname, 'node_modules'),
  },

  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
    publicPath: '/',
  },

  resolve: {
    fallback: path.join(__dirname, 'node_modules'),
    extensions: ['', '.css', '.scss', '.js', '.jsx', '.json'],
    alias: {
      'app': path.join(__dirname, 'app')
    }
  },

  module: {
    loaders: [
      {test: /\.css$/, loaders: ['style', 'css']},
      {test: /\.scss$/, loaders: ['style', 'css', 'postcss-loader', 'sass']},
      {test: /\.json$/, loaders: ['json-loader']},
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {presets: ['es2015', 'react', 'stage-2']}
      }
    ]
  },

  postcss: [autoprefixer({browsers: ['last 2 version']})],

  devtool: 'eval',
  debug: true,
  entry: {
    app: [
      'webpack-dev-server/client?http://0.0.0.0:9000',
      'webpack/hot/only-dev-server',
      './app/bootstrap'
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      ENVIRONMENT: '\'development\'',
      REACT_VERSION: '\'0.14\'',
    }),
    new HtmlWebpackPlugin({
      template: 'app/index.html'
    })
  ],

  devServer: {
    contentBase: './build',
    port: 9000,
    host: '0.0.0.0',
    noInfo: true,
    hot: true,
    inline: true,
    historyApiFallback: true,
  }
}
