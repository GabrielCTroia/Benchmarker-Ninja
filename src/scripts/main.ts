/// <reference path="./vendor.d.ts" />
'use strict';

module BenchmarkerNinja {

  export function isWorking() {
    var map: Immutable.Map<string, number>;
    map = Immutable.Map({a: 1, b: 2});

    console.log('Working still yes?', map);
  }

}

BenchmarkerNinja.isWorking();
