const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: [
    './src/index.js'
  ],
  output: {
    library: 'printJS',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    filename: 'print.js',
    sourceMapFilename: 'print.[ext].map',
    libraryExport: 'default'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'print.css'
    })
  ],
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        test: /\.css$/g
      }),
      new TerserPlugin({
        cache: false,
        parallel: true,
        sourceMap: true, // Must be set to true if using source-maps in production
        terserOptions: {
          mangle: true,
          ie8: true,
          safari10: true
        }
      })
    ]
  }
}
