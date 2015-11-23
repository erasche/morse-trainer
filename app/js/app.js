'use strict';

/* App Module */

var morseApp = angular.module('morseApp', [
  'ngRoute',
  'ngMdIcons',
  'ngMaterial',
  'morseControllers',
  'phonecatFilters'
  //'phonecatServices'
]);


morseApp.config(['$routeProvider', '$mdThemingProvider',
  function($routeProvider, $mdThemingProvider) {

  $mdThemingProvider.theme('default')
    .primaryPalette('pink')
    .accentPalette('orange');

    $routeProvider.
      when('/', {
        templateUrl: 'partials/train.html',
        controller: 'TrainCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);
