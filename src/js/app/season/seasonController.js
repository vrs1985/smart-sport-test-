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