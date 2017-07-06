function checkboxDayLabel() {
  return {
    restrict: "AE",
    scope: {
      item: '=',
      defaultDays: '='
    },
    link: function (scope, elem, attr) {
      var item = scope.item;
      var days = scope.defaultDays;
      var index = days['en'].indexOf(item);
      elem.html(days['ru'][index]);
      days['selected'].push(days.en[index]);
      days['unselected'].splice(days['unselected'].indexOf(item), 1);
    }
  };
};

function checkboxDayInput() {
  return {
    restrict: "AE",
    scope: {
      item: '=',
      defaultDays: '='
    },
    link: {
    pre: function (scope, elem, attr, ctrl) {
    },
    post: function (scope, elem, attr){
      var item = scope.item;
      var days = scope.defaultDays;
// create empty checkbox
        elem.on('click', function () {
        var index = days['selected'].indexOf(item);
        if(elem[0].checked){
          days['selected'].push(scope.item);
          days['unselected'].splice(index, 1);
        }else{
          days['selected'].splice(index, 1);
          days['unselected'].push(scope.item);
        }
                scope.$apply(scope.defaultDays.selected.sort(function(a, b) {
            return a - b;
        }));
      });
// create empty checkbox
    }

    }
  };
};

function addNewShedule() {
    return {
    restrict: "AE",
    controller: 'sheduleCtrl',
    scope: {
      defaultDays: '='
    },
    templateUrl: '../templates/shedule-row.html',
    link: function (scope, elem, attr) {
      elem.on('click', function () {
        // if(days.length === 0){ return }
        var temp = angular.element(document.querySelector("#emptyCheckboxRow"));
        var tempClone = temp.clone();
        var oldelem = angular.element(document.querySelector(".shedules-child"));
        oldelem.parent().append(tempClone);
      });
    }
  };
};


function datepicker() {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      date: '=',
      value: '=valDate',
      model: '=ngModel'
    },
    link: function (scope, elem, attr, ngModel) {
         elem.on('keyup', function (e) {
            console.log(e);
            console.log(ngModel.$viewValue);
        });
    }
  };
};

function timepicker() {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      time: '=',
      model: '=ngModel'
    },
    link: function (scope, elem, attr, ngModel) {
        var data = new Date(new Date(scope.time*1000).getTime());
        var time = moment(data.toString()).format('HH:MM');
        ngModel.$setViewValue(time);
        ngModel.$render();

         elem.on('keyup', function (e) {
            console.log(e);
        });
    }
  };
};