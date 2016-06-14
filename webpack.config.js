var webpack = require('webpack');
var jsFilePrefix = "./tiles/featured-members-tile/public/javascripts";

module.exports = {
  entry: {
    "app": jsFilePrefix + "/jsx/app.js",
    "tileView": jsFilePrefix + "/jsx/tileView.js"
  },
  output:{
    path: jsFilePrefix,
    filename: '[name].js'
  },
  resolve:{
    extension: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query:{
          presets:['react']
        }
      }
    ]
  }
};
