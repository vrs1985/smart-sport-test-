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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xyXG52YXIgc21hcnRzcG9ydCA9IGFuZ3VsYXIubW9kdWxlKCdzbWFydHNwb3J0JywgW1xyXG4gICduZ1JvdXRlJyxcclxuICAnc21hcnRzcG9ydC5zZWFzb24nXHJcbiAgXSlcclxuICAuY29uZmlnKENvbmZBcHApXHJcbiAgLmNvbnRyb2xsZXIoJ01haW5DdHJsJywgTWFpbkN0cmwpXHJcbiAgLmRpcmVjdGl2ZShcImhlYWRlclNtYXJ0c3BvcnRcIiwgSGVhZGVyKVxyXG4gIC5kaXJlY3RpdmUoXCJmb290ZXJTbWFydHNwb3J0XCIsIEZvb3Rlcik7XHJcblxyXG5zbWFydHNwb3J0LnJ1bihmdW5jdGlvbihzZWFzb25EYXRhKSB7XHJcbiAgc2Vhc29uRGF0YTtcclxuICAgIC8vIHZhciBzZWFzb25EYXRhID0gJGxvY2Fsc3RvcmFnZS5nZXRPYmplY3QoJ3NlYXNvbkRhdGEnKTtcclxufSk7XHJcblxyXG4gIGZ1bmN0aW9uIENvbmZBcHAoJHJvdXRlUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XHJcbiAgICAkbG9jYXRpb25Qcm92aWRlci5oYXNoUHJlZml4KCchJyk7XHJcbiAgICAkcm91dGVQcm92aWRlci5vdGhlcndpc2Uoe3JlZGlyZWN0VG86Jy8nfSk7XHJcbiAgfVxyXG4gIENvbmZBcHAuJGluamVjdCA9IFsnJHJvdXRlUHJvdmlkZXInLCAnJGxvY2F0aW9uUHJvdmlkZXInXTtcclxuXHJcbiAgZnVuY3Rpb24gTWFpbkN0cmwoJHNjb3BlLCAkaHR0cCkge1xyXG5cclxuICB9XHJcblxyXG4gIE1haW5DdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckaHR0cCddOyJdLCJmaWxlIjoiYXBwL2FwcC5qcyJ9
