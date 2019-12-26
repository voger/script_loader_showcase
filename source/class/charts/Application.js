/* ************************************************************************

   Copyright: 2019 

   License: MIT license

   Authors: 

 ************************************************************************ */

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

