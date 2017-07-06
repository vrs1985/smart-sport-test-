
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAvZmFjdG9yeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcclxuc21hcnRzcG9ydC5mYWN0b3J5KCckbG9jYWxzdG9yYWdlJywgWyckd2luZG93JywgZnVuY3Rpb24oJHdpbmRvdykge1xyXG4gIHJldHVybiB7XHJcbiAgICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcclxuICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Vba2V5XSA9IHZhbHVlO1xyXG4gICAgfSxcclxuICAgIGdldDogZnVuY3Rpb24oa2V5LCBkZWZhdWx0VmFsdWUpIHtcclxuICAgICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlW2tleV0gfHwgZGVmYXVsdFZhbHVlO1xyXG4gICAgfSxcclxuICAgIHNldE9iamVjdDogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG4gICAgICAkd2luZG93LmxvY2FsU3RvcmFnZVtrZXldID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xyXG4gICAgfSxcclxuICAgIGdldE9iamVjdDogZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlW2tleV0gfHwgJ1tdJyk7XHJcbiAgICB9XHJcbiAgfVxyXG59XSk7XHJcblxyXG5zbWFydHNwb3J0LmZhY3RvcnkoJ3NlYXNvbkRhdGEnLCBbJyRyb290U2NvcGUnLCAnJGh0dHAnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGh0dHApIHtcclxuICB2YXIgZGF0YSA9IHtcclxuICAgIGRhdGE6IFtdXHJcbiAgfTtcclxuICAgICAgJGh0dHAuZ2V0KFwiLi4vZGF0YS9kYXRhLmpzb25cIilcclxuICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkgeyAgZGF0YS5kYXRhID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRzO1xyXG4gICAgICAkcm9vdFNjb3BlLmRhdGEgPSBkYXRhLmRhdGE7XHJcbiAgIH0pO1xyXG4gICAgcmV0dXJuIGRhdGEuZGF0YTtcclxufV0pO1xyXG5cclxuc21hcnRzcG9ydC5mYWN0b3J5KCdjb252ZXJ0VGltZScsIGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4ge1xyXG4gICAgdGltZVRvTXM6IGZ1bmN0aW9uICh0aW1lKSB7XHJcblxyXG4gICAgICByZXR1cm4gO1xyXG4gICAgfSxcclxuICAgIG1zVG9UaW1lOiBmdW5jdGlvbiAobXMpIHtcclxuICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShuZXcgRGF0ZShtcyoxMDAwKS5nZXRUaW1lKCkpO1xyXG4gICAgICB2YXIgdGltZSA9IG1vbWVudChkYXRlLnRvU3RyaW5nKCkpLmZvcm1hdCgnSEg6TU0nKTtcclxuICAgICAgcmV0dXJuIHRpbWU7XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcblxyXG5zbWFydHNwb3J0LmZhY3RvcnkoJ2NoZWNrZWREYXlzJywgZnVuY3Rpb24gKCkge1xyXG4gIHJldHVybiB7XHJcblxyXG4gIH1cclxufSk7Il0sImZpbGUiOiJhcHAvZmFjdG9yeS5qcyJ9
