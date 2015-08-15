/// <reference path="./vendor.d.ts" />
'use strict';

namespace BenchmarkerNinja {

  function getCanvasElement(): HTMLCanvasElement {
    return <HTMLCanvasElement>document.getElementById("myChart");
  }

  var lineChart = new Chart(getCanvasElement().getContext("2d"))
      .Line({
        labels:   [],
        datasets: [
          {
            label:                "Mod",
            fillColor:            Util.colorNameToRgba('blue', .2),
            strokeColor:          Util.colorNameToRgba('blue', .4),
            pointColor:           Util.colorNameToRgba('blue', .6),
            pointStrokeColor:     "#fff",
            pointHighlightFill:   "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data:                 []
          },
          {
            label:                "substring",
            fillColor:            Util.colorNameToRgba('green', .2),
            strokeColor:          Util.colorNameToRgba('green', .4),
            pointColor:           Util.colorNameToRgba('green', .6),
            pointStrokeColor:     "#fff",
            pointHighlightFill:   "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data:                 []
          },
          {
            label:                "Bench Mod Small",
            fillColor:            Util.colorNameToRgba('violet', .2),
            strokeColor:          Util.colorNameToRgba('violet', .4),
            pointColor:           Util.colorNameToRgba('violet', .6),
            pointStrokeColor:     "#fff",
            pointHighlightFill:   "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data:                 []
          }
        ]
      }, getChartOptions());

  function getChartOptions() {
    return {
      legendTemplate: '<ul>'
                      + '<% for (var i=0; i<datasets.length; i++) { %>'
                      + '<li>'
                      + '<span style=\"color:<%=datasets[i].pointColor%>\">'
                      +
                      '<% if (datasets[i].label) { %><%= datasets[i].label %><% } %></span>'
                      + '</li>'
                      + '<% } %>'
                      + '</ul>'
    }
  }

  var $legend = document.createElement('div');
  $legend.innerHTML = lineChart.generateLegend();

  document.body.appendChild($legend);


  function getBreakPoints() {
    return [1, 10, 100, 1000, 10000, 100000];
  }

  var benchmarkModSmall = function () {
    return Lazy(getBreakPoints()).reduce((result, val) => {
      result[val] = Benchmarking.benchmark('Mod',
          function (scope) {
            return scope.num % 10;
          },
          function (scope) {
            scope.num = 61;
          });

      return result;
    }, {});
  };

  var benchmarkSubstring = function () {
    return Lazy(getBreakPoints()).reduce((result, val) => {
      result[val] = Benchmarking.benchmark('Substring',
          function (scope) {
            return scope.string.substr(-1);
          },
          function (scope) {
            scope.string = '612873612937129873129873';
          });

      return result;
    }, {});
  };


  export function runBenchMarkAndUpdateChart() {
    console.log(Lazy([1, 2, 3].map(() => {})));

    Lazy(combine([benchmarkModSmall(), benchmarkSubstring()]))
        .map((val, key) => {
          lineChart.addData(val, key, getChartOptions());
        })
        .toArray();
  }

  function combine(collection) {
    var res = {};

    for (var i = 0; i < collection.length; i++) {
      for (var k in collection[i]) {
        if (collection[i].hasOwnProperty(k)) {
          res[k] = res[k] || [];
          res[k].push(collection[i][k]);
        }
      }
    }

    return res;
  }

}
