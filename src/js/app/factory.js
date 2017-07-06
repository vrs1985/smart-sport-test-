
smartsport.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '[]');
    }
  }
}]);

smartsport.factory('seasonData', ['$rootScope', '$http', function ($rootScope, $http) {
  var data = {
    data: []
  };
      $http.get("../data/data.json")
    .then(function (response) {  data.data = response.data.records;
      $rootScope.data = data.data;
   });
    return data.data;
}]);

smartsport.factory('convertTime', function () {
  return {
    timeToMs: function (time) {

      return ;
    },
    msToTime: function (ms) {
      var date = new Date(new Date(ms*1000).getTime());
      var time = moment(date.toString()).format('HH:MM');
      return time;
    }
  };
});

smartsport.factory('checkedDays', function () {
  return {

  }
});