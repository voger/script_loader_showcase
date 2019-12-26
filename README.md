Example application showcasing how to use expose npm packages and 
load them in a qooxdoo application using webpack and expose-loader.

I wrote it mostly to keep note for my self the walkthrough. 
Improvements, sugestions etc. are welcome.

We will use [amcharts][amcharts] as an example. Amcharts provides loadable
files from a CDN and even allows copying those files in our own server. 
There is no need to go through the webpack steps just for using Amcharts.
However we are going to do this the hard way for fun and knowledge.

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

Follow good practices. Use version control. Edit the file .gitignore and add `node_modules/`

```shell
# .gitignore template for skeleton-based apps
/compiled
/qx_packages
.package-cache.json
/node_modules
```

And then in the command line

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
 $ npm install --save-dev webpack webpack-cli expose-loader license-webpack-plugin uglifyjs-webpack-plugin
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
```

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
    path: path.resolve(__dirname, './source/resource/js/amcharts')
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
      }]
    },{ 
      test: require.resolve('@amcharts/amcharts4/charts'),
      use: [{
        loader: 'expose-loader',
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

This will create the files in `source/resource/js` folder.

### Use the library

In the file `Manifest.json` add a key `externalResources` that includes
the generated file.

```json
{
  "$schema": "https://raw.githubusercontent.com/qooxdoo/qooxdoo-compiler/master/source/resource/qx/tool/schema/Manifest-1-0-0.json",
  "info" :
  {
    "name" : "charts",

    "summary" : "",
    "description" : "",

    "homepage" : "",

    "license" : "MIT license",
    "authors" : [
      {
        "name": "",
        "email": ""
      }
    ],

    "version" : "1.0.0"
  },

  "provides" :
  {
    "namespace"   : "charts",
    "encoding"    : "utf-8",
    "class"       : "source/class",
    "resource"    : "source/resource",
    "translation" : "source/translation"
  },

  "requires": {
    "@qooxdoo/framework": "^6.0.0-beta",
    "@qooxdoo/compiler" : "^1.0.0-beta"
  },

  "externalResources": {
    "script": [
      "js/amcharts/amcharts.js"
    ]
  }
}
```

Create the wrapper class

```javascript 
/**
 * @ignore(am4charts.PieSeries)
 * @ignore(am4charts.PieChart)
 * @ignore(am4core.create)
 *
 */
qx.Class.define("charts.PieChart", {
  extend: qx.ui.core.Widget,

  construct: function() {
    this.base(arguments);
    this.__chartSeries = new am4charts.PieSeries();
    
    this.addListenerOnce("appear", this.__onAppear, this);
  },

  members: {
    // the HTML element containing the chart
    __domElement: null,

    // the chart object
    __chart: null,

    // the data series
    __chartSeries: null,

    // keep the data if the chart is not ready yet
    __chartData: null,

    // chart's legend
    __legend: null,


    /**
     * Adds a value to the series data field
     * @param value {String}
     */
    setValue: function(value) {
      this.__chartSeries.dataFields.value = value;
    } ,

    /**
     * Adds a category to the series data field
     * @param category {String}
     */
    setCategory: function(category) {
      this.__chartSeries.dataFields.category = category;
    },

    /**
     * Adds data to be charted
     * @param data {Array}
     */
    setData: function(data) {
      if (this.__chart) {
        this.__chart.data = data;
      } else {
        this.__chartData = data;
      }
    },

    __onAppear: function() {
      var element = this.getContentElement().getDomElement();
      this.__chart = am4core.create(element, am4charts.PieChart);
      this.__chart.series.push(this.__chartSeries);
      this.__chart.data = this.__chartData;

      // we won't be needing this anymore. remove the reference
      this.__chartData = null;
    }
  }
});
```

Those `@ignore` statements at the top of the class hint the compiler
that it should not try to find their definitions in our qooxdoo code.

What is important to notice here is that the `am4core` and `am4charts` 
objects are exposed to our browser to use. This can be easily verified
by going in the browser's console and trying to play with them.

Finaly use our loaded file in our qooxdoo application. In `Application.js` 
type the following 

```javascript
/**
 * This is the main application class of "charts"
 *
 * @asset(charts/*)
*/
qx.Class.define("charts.Application",
  {
    extend : qx.application.Standalone,



    /*
     *****************************************************************************
     MEMBERS
     *****************************************************************************
     */

    members :
    {
      /**
       * This method contains the initial application code and gets called 
       * during startup of the application
       * 
       * @lint ignoreDeprecated(alert)
       */
      main : function()
      {
        // Call super class
        this.base(arguments);

        // Enable logging in debug variant
        if (qx.core.Environment.get("qx.debug"))
        {
          // support native logging capabilities, e.g. Firebug for Firefox
          qx.log.appender.Native;
          // support additional cross-browser console. Press F7 to toggle visibility
          qx.log.appender.Console;
        }

        /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */


        var chartLoader = new qx.util.DynamicScriptLoader([
          "js/amcharts/amcharts.js"
        ]); 

        chartLoader.addListenerOnce("ready", function() {
          this.info("All scripts have been loaded");

          // Document is the application root
          var doc = this.getRoot();
          var pieChart = new charts.PieChart();
          pieChart.setValue("litres");
          pieChart.setCategory("country");
          pieChart.setData(this.__getData());

          pieChart.setWidth(800);
          pieChart.setHeight(400);
          
          doc.add(pieChart, {left: 100, top: 50});
        }, this);

        chartLoader.addListener("failed", function(e) {
          var data = e.getData();
          this.error(`Failed loading script ${data}`);
        }, this);

        chartLoader.start();
      },

      __getData: function() {
        return [{
          "country": "Lithuania",
          "litres": 501.9
        }, {
          "country": "Czech Republic",
          "litres": 301.9
        }, {
          "country": "Ireland",
          "litres": 201.1
        }, {
          "country": "Germany",
          "litres": 165.8
        }, {
          "country": "Australia",
          "litres": 139.9
        }, {
          "country": "Austria",
          "litres": 128.3
        }, {
          "country": "UK",
          "litres": 99
        }, {
          "country": "Belgium",
          "litres": 60
        }, {
          "country": "The Netherlands",
          "litres": 50
        }];
      }
    }
  });

```

Here we listen for the `loaded` event to kickstart our chart creation. We could very well await the promise from the `chartLoader.start()` instead.

Run 

```console
$ npx qx serve
```

to see our glorious creation

![pie chart](./images/gloriousCreation.png?raw=true)

References:

- [webpack documentation][webpackdocs]
- [Using non-qooxdoo, third-party libraries][qooxdoodocs]
- [Amcharts][amcharts]
- [Amcharts with webpack guide][amwebpack]

[amcharts]: https://www.amcharts.com
[amwebpack]: https://www.amcharts.com/docs/v4/getting-started/integrations/using-webpack/
[webpackdocs]: https://webpack.js.org/concepts/
[qooxdoodocs]: https://github.com/qooxdoo/qooxdoo/blob/master/documentation/manual/source/pages/development/using_non_qx_libs.rst
