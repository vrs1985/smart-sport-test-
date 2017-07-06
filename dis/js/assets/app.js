'use strict'
var season = angular.module('season', [
  'ui.router'])
  .config(ConfApp)
  .controller('MainCtrl', MainCtrl);

  function ConfApp($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise( '/' );
  }

  function MainCtrl() {

  }
  MainCtrl.$inject = [];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhc3NldHMvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xyXG52YXIgc2Vhc29uID0gYW5ndWxhci5tb2R1bGUoJ3NlYXNvbicsIFtcclxuICAndWkucm91dGVyJ10pXHJcbiAgLmNvbmZpZyhDb25mQXBwKVxyXG4gIC5jb250cm9sbGVyKCdNYWluQ3RybCcsIE1haW5DdHJsKTtcclxuXHJcbiAgZnVuY3Rpb24gQ29uZkFwcCgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xyXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSggJy8nICk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBNYWluQ3RybCgpIHtcclxuXHJcbiAgfVxyXG4gIE1haW5DdHJsLiRpbmplY3QgPSBbXTsiXSwiZmlsZSI6ImFzc2V0cy9hcHAuanMifQ==
