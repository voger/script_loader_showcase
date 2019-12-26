const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;

module.exports = {
  mode: 'production',
  entry: './source/resource/exposed.js',
  devtool: "source-map",
  output: {
    filename: 'amcharts.js',
    chunkFilename: "[name].js",
    path: path.resolve(__dirname, './source/resource/js/amcharts.js')
  },

  plugins: [
    new LicenseWebpackPlugin({addBanner: true})
  ],

  optimization: {
    minimizer: [new UglifyJsPlugin()],
  },

  module: {
    rules: [{ 
      test: require.resolve('@amcharts/amcharts4/core'),
      use: [{
        loader: 'expose-loader',
        options: 'amcharts'
      },{
        loader: 'expose-loader',
        options: 'amcharts'
      }]
    }
      ,{
        test: /\.js$/,
        include: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-syntax-dynamic-import"]
          }
        }
      }, {
        test: /.js$/,
        use: ["source-map-loader"],
        enforce: "pre"
      }]
  }
}
