'use strict';

namespace BenchmarkerNinja.Benchmarking {

  export function benchmark(name, fn, prepareFn?, cleanFn?) {
    var r = getBenchmarkingAverage(name, getAverageFactor(), fn, prepareFn, cleanFn);

    console.log('Benchmark:', r);
    console.log('----------');

    return r;
  }

  function getBenchmarkingAverage(name, factor, fn, prepareFn, cleanFn) {
    var scope = {};

    if (typeof prepareFn === 'function') {
      prepareFn(scope);

      console.log('Prepared', name, 'successfully!');
    }

    var res = Lazy(Lazy.range(factor))
            .reduce((result) => {
              var t0 = performance.now();
              fn(scope);

              result += performance.now() - t0;

              return result;
            }, 0) / factor;

    if (typeof cleanFn === 'function') {
      cleanFn(scope);
    }

    // Clean the scope
    scope = {};

    return res;
  }

  function getAverageFactor() {
    return 10;
  }

  function performanceTracker(fn, name) {
    return function () {
      console.log(name + ' started...');
      var t0 = performance.now();
      fn.apply(fn, arguments);
      var t1 = performance.now();

      console.log(name + ' took ' + (t1 - t0) + ' milliseconds');
      console.log('-----------');
    }
  }

}
