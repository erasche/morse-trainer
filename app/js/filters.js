'use strict';

/* Filters */

angular.module('morseFilters', []).filter('checkmark', function() {
  return function(input) {
    return input ? '\u2713' : '\u2718';
  };
});

angular.module('morseFilters', []).filter('join', function() {
  return function(input, letter) {
    return input.join(letter)
  };
});
