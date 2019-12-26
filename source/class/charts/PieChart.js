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
