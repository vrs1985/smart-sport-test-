var season = angular.module("smartsport.season", [
  'ngRoute',
  'smartsport',
  ])
.controller("SeasonPageCtrl", SeasonPageCtrl)
.directive("progressSeason", progressSeason)
.directive("sheduleSeason", sheduleSeason)
.directive("categoriesSeason", categoriesSeason)
.directive("bathroomsSeason", bathroomsSeason)
.directive("pricesSeason", pricesSeason)
.directive("fullPriceSeason", fullPriceSeason)
.directive("datepicker", datepicker)
.directive("checkboxDayLabel", checkboxDayLabel)
.directive("checkboxDayInput", checkboxDayInput)
.directive("timepicker", timepicker)
.directive("addFreeCheckbox", addFreeCheckbox)
.directive("addNewShedule", addNewShedule);


function SeasonPageCtrl($scope, $http) {
    $http.get("../data/data.json")
    .then(function (response) { $scope.data = response.data.records;
   });
    $scope.submitSeasonForm = function() {
        console.log("sending data....");
        $http.post('page.php', JSON.stringify(data)).success(function(){console.log('data has been sent');});
    };
}

SeasonPageCtrl.$inject = ['$scope', '$http'];