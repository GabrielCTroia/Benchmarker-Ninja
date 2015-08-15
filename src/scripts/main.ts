/// <reference path="./vendor.d.ts" />
'use strict';

module BenchmarkerNinja {

  export function isWorking() {
    //var map: Immutable.Map<string, number>;
    //map = Immutable.Map({a: 1, b: 2});

    var a: _.List<string>;

    console.log('Working still yes?');
  }

}

BenchmarkerNinja.isWorking();

BenchmarkerNinja.test();
