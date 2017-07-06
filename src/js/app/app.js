'use strict'
var smartsport = angular.module('smartsport', [
  'ngRoute',
  'smartsport.season'
  ])
  .config(ConfApp)
  .controller('MainCtrl', MainCtrl)
  .directive("headerSmartsport", Header)
  .directive("footerSmartsport", Footer);

smartsport.run(function(seasonData) {
  seasonData;
    // var seasonData = $localstorage.getObject('seasonData');
});

  function ConfApp($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({redirectTo:'/'});
  }
  ConfApp.$inject = ['$routeProvider', '$locationProvider'];

  function MainCtrl($scope, $http) {

  }

  MainCtrl.$inject = ['$scope', '$http'];