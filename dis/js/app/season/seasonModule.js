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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAvc2Vhc29uL3NlYXNvbk1vZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgc2Vhc29uID0gYW5ndWxhci5tb2R1bGUoXCJzbWFydHNwb3J0LnNlYXNvblwiLCBbXHJcbiAgJ25nUm91dGUnLFxyXG4gICdzbWFydHNwb3J0JyxcclxuICBdKVxyXG4uY29udHJvbGxlcihcIlNlYXNvblBhZ2VDdHJsXCIsIFNlYXNvblBhZ2VDdHJsKVxyXG4uZGlyZWN0aXZlKFwicHJvZ3Jlc3NTZWFzb25cIiwgcHJvZ3Jlc3NTZWFzb24pXHJcbi5kaXJlY3RpdmUoXCJzaGVkdWxlU2Vhc29uXCIsIHNoZWR1bGVTZWFzb24pXHJcbi5kaXJlY3RpdmUoXCJjYXRlZ29yaWVzU2Vhc29uXCIsIGNhdGVnb3JpZXNTZWFzb24pXHJcbi5kaXJlY3RpdmUoXCJiYXRocm9vbXNTZWFzb25cIiwgYmF0aHJvb21zU2Vhc29uKVxyXG4uZGlyZWN0aXZlKFwicHJpY2VzU2Vhc29uXCIsIHByaWNlc1NlYXNvbilcclxuLmRpcmVjdGl2ZShcImZ1bGxQcmljZVNlYXNvblwiLCBmdWxsUHJpY2VTZWFzb24pXHJcbi5kaXJlY3RpdmUoXCJkYXRlcGlja2VyXCIsIGRhdGVwaWNrZXIpXHJcbi5kaXJlY3RpdmUoXCJjaGVja2JveERheUxhYmVsXCIsIGNoZWNrYm94RGF5TGFiZWwpXHJcbi5kaXJlY3RpdmUoXCJjaGVja2JveERheUlucHV0XCIsIGNoZWNrYm94RGF5SW5wdXQpXHJcbi5kaXJlY3RpdmUoXCJ0aW1lcGlja2VyXCIsIHRpbWVwaWNrZXIpXHJcbi5kaXJlY3RpdmUoXCJhZGRGcmVlQ2hlY2tib3hcIiwgYWRkRnJlZUNoZWNrYm94KVxyXG4uZGlyZWN0aXZlKFwiYWRkTmV3U2hlZHVsZVwiLCBhZGROZXdTaGVkdWxlKTtcclxuXHJcblxyXG5mdW5jdGlvbiBTZWFzb25QYWdlQ3RybCgkc2NvcGUsICRodHRwKSB7XHJcbiAgICAkaHR0cC5nZXQoXCIuLi9kYXRhL2RhdGEuanNvblwiKVxyXG4gICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7ICRzY29wZS5kYXRhID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRzO1xyXG4gICB9KTtcclxuICAgICRzY29wZS5zdWJtaXRTZWFzb25Gb3JtID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzZW5kaW5nIGRhdGEuLi4uXCIpO1xyXG4gICAgICAgICRodHRwLnBvc3QoJ3BhZ2UucGhwJywgSlNPTi5zdHJpbmdpZnkoZGF0YSkpLnN1Y2Nlc3MoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygnZGF0YSBoYXMgYmVlbiBzZW50Jyk7fSk7XHJcbiAgICB9O1xyXG59XHJcblxyXG5TZWFzb25QYWdlQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGh0dHAnXTsiXSwiZmlsZSI6ImFwcC9zZWFzb24vc2Vhc29uTW9kdWxlLmpzIn0=
