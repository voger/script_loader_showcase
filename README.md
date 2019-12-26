Example application showcasing how to use expose npm packages and 
load them in a qooxdoo application using webpack and expose-loader.

I wrote it mostly to keep note for my self the walkthrough. 
Improvements, sugestions etc. are welcome.

We will use [amcharts][amcharts] as an example.

### Initialize a qooxdoo application

First create the qooxdoo application. Run

```console
  $ npx qx create charts --type desktop --namespace charts --out charts
```

and follow the instructions.

Then cd into it and initialize a npm package

```console
  $ cd charts
  $ npm init -y
```

You probably don't want to publish this project to npmjs so it is a good
idea to mark it as private. Edit the file `package.json` and add the private
key

```json
{
  "name": "charts",
  "version": "1.0.0",
  "description": "Example application showcasing how to use expose npm packages and  load them in a qooxdoo application using webpack and expose-loader.",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "private": true,
  "author": "",
  "license": "ISC"
}
```

Follow good practices. Use version control. Edit the file .gitignore and add `node_modules/ 

```shell
# .gitignore template for skeleton-based apps
/compiled
/qx_packages
.package-cache.json
/node_modules
```

```console
 $ git init
 $ git add .
 $ git commit -m "Initial commit"
```

For the sake of brevity all branching and merging steps will be ommited.
They are good prectices though and should be followed.

### Install needed libraries

To use webpack we will need the following libraries

```console
 $ npm install --save-dev webpack webpack-clie expose-loader license-webpack-plugin uglifyjs-webpack-plugin
```

All are installed as development dependencies.

To use amcharts we install that too as a development dependency

```console
  $ npm install --save-dev @amcharts/amcharts4
```

Especially for building amcharts which is large library and
it is written in typescript, we also install

```console
  $ `npm install --save-dev source-map-loader @babel/core @babel/preset-env @babel/plugin-syntax-dynamic-import babel-loader``

### Configure webpack

Create in the root of the project a file named `webpack.config.js` 
with the following content

```javascript
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;

module.exports = {
  mode: 'production',
  entry: './source/resource/exposed.js',
  output: {
    filename: 'amcharts.js',
    path: path.resolve(__dirname, './source/resource/js/amcharts.js')
  },

  plugins: [
    new LicenseWebpackPlugin({addBanner: true})
  ],

  optimization: {
    minimizer: [new UglifyJsPlugin()],
  }
}
```

* `entry` is the name of the javascript file that generates the exports
* `outupt` is where the generated file wil be placed
* we use the license-webpack-plugin to manage the various exported packages licanses
* we minimize the build with the uglifyjs-webpack-plugin

That will suffice for most simple and small libraries

Since amcharts recommends using the source map loader plugin we modify
our `webpack.config.js` file. This file is taken and modified from the [amcharts
documentation][amwebpack].

```javascript
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
```

### Expose the library

Create the file `./source/resource/exposed.js` with this content
```javascript
require("expose-loader?amcharts4!@amcharts/amcharts4/core");
```

and run in the command line 

```console
 $ npx webpack-cli
```

[amcharts]: https://www.amcharts.com
[amwebpack]: https://www.amcharts.com/docs/v4/getting-started/integrations/using-webpack/
