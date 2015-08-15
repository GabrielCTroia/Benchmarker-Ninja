/// <reference path="./vendor.d.ts" />
'use strict';

namespace BenchmarkerNinja {

  Benchmarking.benchmark(
      'Mod',
      (scope) => scope.num % 10,
      (scope) => {
        scope.num = 612873612937129873129873;
      });

}
