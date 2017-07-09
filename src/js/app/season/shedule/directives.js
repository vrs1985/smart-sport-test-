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
      days['selected'].push(item);
      days['unselected'].splice(days['unselected'].indexOf(index), 1);
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
          days['selected'].push(item);
          days['unselected'].splice(index, 1);
        }else{
          days['selected'].splice(index, 1);
          days['unselected'].push(item);
        }
        scope.$apply();
      });
// create empty checkbox
    }

    }
  };
};

function addNewShedule(checkboxComponent, $compile) {
    return {
    restrict: "AE",
    controller: 'sheduleCtrl',
    scope: {
      defaultDays: '='
    },
    link: function (scope, elem, attr) {
      elem.on('click', function () {
        var daysUnselect = scope.defaultDays.unselected;
        var daysRu = scope.defaultDays.ru;
        var daysEn = scope.defaultDays.en;

        if(daysUnselect.length === 0){ return };
        var element = angular.element(document.querySelector(".shedules-child")); // find checkbox first row
        var elemClone = element.clone();
        var unchecked = angular.element('<div add-free-checkbox></div>').addClass('checkbox');
        elemClone[0].querySelector('[name="worktimeOneFrom"]').replaceWith(checkboxComponent.inputTime('worktimeOneFrom')[0]); // create innput (through factory) and replace our input time
        elemClone[0].querySelector('[name="worktimeOneTo"]').replaceWith(checkboxComponent.inputTime('worktimeOneTo')[0]);
        elemClone[0].querySelector('.checkbox')
          .replaceWith(unchecked[0]); // replace our checkbox group
// create clear checkbox row
        for(var i=0;i<daysUnselect.length;i++){
          unchecked.append(checkboxComponent.block(daysUnselect[i], scope.days));
        }
// create clear checkbox row
        var parent = element.parent();
        parent.append(elemClone[0]); console.log(elemClone.eq(0).find('input'));
        // $compile(elemClone)(scope);
      });
    }
  };
};
addNewShedule.$inject = ['checkboxComponent', '$compile'];

function addFreeCheckbox(checkboxComponent) {
  return {
    link: {
      post: function (scope, elem, attr, ctrl) {
          elem.on('click', function (e) {
            var unselected = scope.days.unselected;
            var checkboxes = angular.element(document.querySelectorAll('.checkbox'));
            for(var i=0;i<checkboxes.length;i++){
              var input = checkboxes.eq(i).children().find('input');
              var checkbox = [];
              for(let j=0;j<input.length;j++){
                checkbox.push(input.eq(j).attr('name'));
              }
              for (let j = 0; j < unselected.length; j++) {
                if(checkbox.indexOf(unselected[j]) === -1){
                  checkboxes.eq(i).append(checkboxComponent.block(unselected[j], scope.days));
                };
              }
            }


          if(angular.element(e.target).prop('checked')){
            // angular.element(e.target).attr('name')
            for(var i=0;i<checkboxes.length;i++){
              var input = checkboxes.eq(i).children().find('input');
              for(var j=0;j<input.length;j++){
                if(input.eq(j).attr('name') === angular.element(e.target).attr('name')
                  && !input.eq(j).prop('checked')){
                    input.eq(j).remove();
                    checkboxes.eq(i).children().find('label').eq(j).remove();
                    var index = scope.days['unselected'].indexOf(input.eq(j).attr('name')); console.log(index);
                    scope.days['unselected'].splice(index, 1);
                    scope.days['selected'].push(input.eq(j).attr('name'));
                    scope.$apply();
                }
                // console.log((input[j]).attr('name'));
              }
            }

          }else{
            console.log(angular.element(e.target).attr('name'), angular.element(e.target).prop('checked'));
          }
          });
        }
      }
  };
};
addFreeCheckbox.$inject = ['checkboxComponent'];

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