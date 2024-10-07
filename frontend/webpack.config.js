const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    main: './js/main.js',
    auth: './js/auth.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public'),
    clean: true, // This will clean the output directory before each build
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html'
    }),
    new CopyPlugin({
      patterns: [
        { from: 'favicon.ico', to: 'favicon.ico' },
        { from: 'css', to: 'css' },
        { from: 'logo.png', to: 'logo.png' },
        { from: 'default-pfp.jpg', to: 'default-pfp.jpg' },
        { from: 'privacy-policy.html', to: 'privacy-policy.html' },
        { from: 'terms.html', to: 'terms.html' }
      ],
    }),
    new Dotenv({
      systemvars: true,
      safe: false
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8080,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
};