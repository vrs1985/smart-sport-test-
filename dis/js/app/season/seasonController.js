season.controller('progressCtrl', ProgressCtrl);
function ProgressCtrl($scope, $http, $rootScope) {
  var data = $rootScope.data[0].progress;
  $scope.svg = {
    file: ['images/progress-bar-1.svg', 'images/progress-bar-2.svg'],
    progress:data
  };
}
ProgressCtrl.$injector = ['$scope', '$http', '$rootScope'];

season.controller('sheduleCtrl', SheduleCtrl);
function SheduleCtrl(convertTime, $rootScope, $scope, $http, $filter) {
$scope.seasons = $rootScope.data[1].seasons;

$scope.days={
  en: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  selected: [],
  unselected: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
};

$scope.defDate = {
  now: new Date()
};

}
SheduleCtrl.$injector = ['convertTime', '$rootScope', '$http', '$scope', '$filter'];


season.controller('categoriesCtrl', CategoriesCtrl);
function CategoriesCtrl($rootScope, $scope, $http) {
  var data = $rootScope.data[2].categories;

  $scope.categories = data;

  $scope.remove = function (id) { // удаляем категорию
    $rootScope.data[2].categories.splice(id, 1);
  }

  $scope.add = function (country) { // добавляем категорию
    var category = data;
    category.push(country);
    $rootScope.data[2].categories = category;
  }

}
CategoriesCtrl.$injector = ['$rootScope', '$http', '$scope'];

season.controller('bathroomsCtrl', BathroomsCtrl);
function BathroomsCtrl($scope, $http) {

}
BathroomsCtrl.$injector = ['$scope', '$http'];

season.controller('pricesCtrl', PricesCtrl);
function PricesCtrl($scope, $http) {

}
PricesCtrl.$injector = ['$scope', '$http'];

season.controller('fullPriceCtrl', FullPriceCtrl);
function FullPriceCtrl($scope, $http) {
  $scope.fullPrice = false;

}
FullPriceCtrl.$injector = ['$scope', '$http'];


season.controller('datepickerCtrl', DatepickerCtrl);
function DatepickerCtrl($rootScope, $scope) {
  $scope.seasons = $rootScope.data[0].seasons;

}
DatepickerCtrl.$injector = ['$rootScope', '$scope'];


season.controller('timepickerCtrl', TimepickerCtrl);
function TimepickerCtrl($scope) {

}
TimepickerCtrl.$injector = ['$scope'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAvc2Vhc29uL3NlYXNvbkNvbnRyb2xsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsic2Vhc29uLmNvbnRyb2xsZXIoJ3Byb2dyZXNzQ3RybCcsIFByb2dyZXNzQ3RybCk7XHJcbmZ1bmN0aW9uIFByb2dyZXNzQ3RybCgkc2NvcGUsICRodHRwLCAkcm9vdFNjb3BlKSB7XHJcbiAgdmFyIGRhdGEgPSAkcm9vdFNjb3BlLmRhdGFbMF0ucHJvZ3Jlc3M7XHJcbiAgJHNjb3BlLnN2ZyA9IHtcclxuICAgIGZpbGU6IFsnaW1hZ2VzL3Byb2dyZXNzLWJhci0xLnN2ZycsICdpbWFnZXMvcHJvZ3Jlc3MtYmFyLTIuc3ZnJ10sXHJcbiAgICBwcm9ncmVzczpkYXRhXHJcbiAgfTtcclxufVxyXG5Qcm9ncmVzc0N0cmwuJGluamVjdG9yID0gWyckc2NvcGUnLCAnJGh0dHAnLCAnJHJvb3RTY29wZSddO1xyXG5cclxuc2Vhc29uLmNvbnRyb2xsZXIoJ3NoZWR1bGVDdHJsJywgU2hlZHVsZUN0cmwpO1xyXG5mdW5jdGlvbiBTaGVkdWxlQ3RybChjb252ZXJ0VGltZSwgJHJvb3RTY29wZSwgJHNjb3BlLCAkaHR0cCwgJGZpbHRlcikge1xyXG4kc2NvcGUuc2Vhc29ucyA9ICRyb290U2NvcGUuZGF0YVsxXS5zZWFzb25zO1xyXG5cclxuJHNjb3BlLmRheXM9e1xyXG4gIGVuOiBbXCJtb25cIiwgXCJ0dWVcIiwgXCJ3ZWRcIiwgXCJ0aHVcIiwgXCJmcmlcIiwgXCJzYXRcIiwgXCJzdW5cIl0sXHJcbiAgcnU6IFtcItCf0L1cIiwgXCLQktGCXCIsIFwi0KHRgFwiLCBcItCn0YJcIiwgXCLQn9GCXCIsIFwi0KHQsVwiLCBcItCS0YFcIl0sXHJcbiAgc2VsZWN0ZWQ6IFtdLFxyXG4gIHVuc2VsZWN0ZWQ6IFtcIm1vblwiLCBcInR1ZVwiLCBcIndlZFwiLCBcInRodVwiLCBcImZyaVwiLCBcInNhdFwiLCBcInN1blwiXVxyXG59O1xyXG5cclxuJHNjb3BlLmRlZkRhdGUgPSB7XHJcbiAgbm93OiBuZXcgRGF0ZSgpXHJcbn07XHJcblxyXG59XHJcblNoZWR1bGVDdHJsLiRpbmplY3RvciA9IFsnY29udmVydFRpbWUnLCAnJHJvb3RTY29wZScsICckaHR0cCcsICckc2NvcGUnLCAnJGZpbHRlciddO1xyXG5cclxuXHJcbnNlYXNvbi5jb250cm9sbGVyKCdjYXRlZ29yaWVzQ3RybCcsIENhdGVnb3JpZXNDdHJsKTtcclxuZnVuY3Rpb24gQ2F0ZWdvcmllc0N0cmwoJHJvb3RTY29wZSwgJHNjb3BlLCAkaHR0cCkge1xyXG4gIHZhciBkYXRhID0gJHJvb3RTY29wZS5kYXRhWzJdLmNhdGVnb3JpZXM7XHJcblxyXG4gICRzY29wZS5jYXRlZ29yaWVzID0gZGF0YTtcclxuXHJcbiAgJHNjb3BlLnJlbW92ZSA9IGZ1bmN0aW9uIChpZCkgeyAvLyDRg9C00LDQu9GP0LXQvCDQutCw0YLQtdCz0L7RgNC40Y5cclxuICAgICRyb290U2NvcGUuZGF0YVsyXS5jYXRlZ29yaWVzLnNwbGljZShpZCwgMSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuYWRkID0gZnVuY3Rpb24gKGNvdW50cnkpIHsgLy8g0LTQvtCx0LDQstC70Y/QtdC8INC60LDRgtC10LPQvtGA0LjRjlxyXG4gICAgdmFyIGNhdGVnb3J5ID0gZGF0YTtcclxuICAgIGNhdGVnb3J5LnB1c2goY291bnRyeSk7XHJcbiAgICAkcm9vdFNjb3BlLmRhdGFbMl0uY2F0ZWdvcmllcyA9IGNhdGVnb3J5O1xyXG4gIH1cclxuXHJcbn1cclxuQ2F0ZWdvcmllc0N0cmwuJGluamVjdG9yID0gWyckcm9vdFNjb3BlJywgJyRodHRwJywgJyRzY29wZSddO1xyXG5cclxuc2Vhc29uLmNvbnRyb2xsZXIoJ2JhdGhyb29tc0N0cmwnLCBCYXRocm9vbXNDdHJsKTtcclxuZnVuY3Rpb24gQmF0aHJvb21zQ3RybCgkc2NvcGUsICRodHRwKSB7XHJcblxyXG59XHJcbkJhdGhyb29tc0N0cmwuJGluamVjdG9yID0gWyckc2NvcGUnLCAnJGh0dHAnXTtcclxuXHJcbnNlYXNvbi5jb250cm9sbGVyKCdwcmljZXNDdHJsJywgUHJpY2VzQ3RybCk7XHJcbmZ1bmN0aW9uIFByaWNlc0N0cmwoJHNjb3BlLCAkaHR0cCkge1xyXG5cclxufVxyXG5QcmljZXNDdHJsLiRpbmplY3RvciA9IFsnJHNjb3BlJywgJyRodHRwJ107XHJcblxyXG5zZWFzb24uY29udHJvbGxlcignZnVsbFByaWNlQ3RybCcsIEZ1bGxQcmljZUN0cmwpO1xyXG5mdW5jdGlvbiBGdWxsUHJpY2VDdHJsKCRzY29wZSwgJGh0dHApIHtcclxuICAkc2NvcGUuZnVsbFByaWNlID0gZmFsc2U7XHJcblxyXG59XHJcbkZ1bGxQcmljZUN0cmwuJGluamVjdG9yID0gWyckc2NvcGUnLCAnJGh0dHAnXTtcclxuXHJcblxyXG5zZWFzb24uY29udHJvbGxlcignZGF0ZXBpY2tlckN0cmwnLCBEYXRlcGlja2VyQ3RybCk7XHJcbmZ1bmN0aW9uIERhdGVwaWNrZXJDdHJsKCRyb290U2NvcGUsICRzY29wZSkge1xyXG4gICRzY29wZS5zZWFzb25zID0gJHJvb3RTY29wZS5kYXRhWzBdLnNlYXNvbnM7XHJcblxyXG59XHJcbkRhdGVwaWNrZXJDdHJsLiRpbmplY3RvciA9IFsnJHJvb3RTY29wZScsICckc2NvcGUnXTtcclxuXHJcblxyXG5zZWFzb24uY29udHJvbGxlcigndGltZXBpY2tlckN0cmwnLCBUaW1lcGlja2VyQ3RybCk7XHJcbmZ1bmN0aW9uIFRpbWVwaWNrZXJDdHJsKCRzY29wZSkge1xyXG5cclxufVxyXG5UaW1lcGlja2VyQ3RybC4kaW5qZWN0b3IgPSBbJyRzY29wZSddOyJdLCJmaWxlIjoiYXBwL3NlYXNvbi9zZWFzb25Db250cm9sbGVyLmpzIn0=
