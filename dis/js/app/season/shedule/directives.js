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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAvc2Vhc29uL3NoZWR1bGUvZGlyZWN0aXZlcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBjaGVja2JveERheUxhYmVsKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogXCJBRVwiLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgaXRlbTogJz0nLFxyXG4gICAgICBkZWZhdWx0RGF5czogJz0nXHJcbiAgICB9LFxyXG4gICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtLCBhdHRyKSB7XHJcbiAgICAgIHZhciBpdGVtID0gc2NvcGUuaXRlbTtcclxuICAgICAgdmFyIGRheXMgPSBzY29wZS5kZWZhdWx0RGF5cztcclxuICAgICAgdmFyIGluZGV4ID0gZGF5c1snZW4nXS5pbmRleE9mKGl0ZW0pO1xyXG4gICAgICBlbGVtLmh0bWwoZGF5c1sncnUnXVtpbmRleF0pO1xyXG4gICAgICBkYXlzWydzZWxlY3RlZCddLnB1c2goaXRlbSk7XHJcbiAgICAgIGRheXNbJ3Vuc2VsZWN0ZWQnXS5zcGxpY2UoZGF5c1sndW5zZWxlY3RlZCddLmluZGV4T2YoaW5kZXgpLCAxKTtcclxuICAgIH1cclxuICB9O1xyXG59O1xyXG5cclxuZnVuY3Rpb24gY2hlY2tib3hEYXlJbnB1dCgpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6IFwiQUVcIixcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGl0ZW06ICc9JyxcclxuICAgICAgZGVmYXVsdERheXM6ICc9J1xyXG4gICAgfSxcclxuICAgIGxpbms6IHtcclxuICAgIHByZTogZnVuY3Rpb24gKHNjb3BlLCBlbGVtLCBhdHRyLCBjdHJsKSB7XHJcbiAgICB9LFxyXG4gICAgcG9zdDogZnVuY3Rpb24gKHNjb3BlLCBlbGVtLCBhdHRyKXtcclxuICAgICAgdmFyIGl0ZW0gPSBzY29wZS5pdGVtO1xyXG4gICAgICB2YXIgZGF5cyA9IHNjb3BlLmRlZmF1bHREYXlzO1xyXG4vLyBjcmVhdGUgZW1wdHkgY2hlY2tib3hcclxuICAgICAgICBlbGVtLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgaW5kZXggPSBkYXlzWydzZWxlY3RlZCddLmluZGV4T2YoaXRlbSk7XHJcbiAgICAgICAgaWYoZWxlbVswXS5jaGVja2VkKXtcclxuICAgICAgICAgIGRheXNbJ3NlbGVjdGVkJ10ucHVzaChpdGVtKTtcclxuICAgICAgICAgIGRheXNbJ3Vuc2VsZWN0ZWQnXS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgZGF5c1snc2VsZWN0ZWQnXS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgZGF5c1sndW5zZWxlY3RlZCddLnB1c2goaXRlbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICB9KTtcclxuLy8gY3JlYXRlIGVtcHR5IGNoZWNrYm94XHJcbiAgICB9XHJcblxyXG4gICAgfVxyXG4gIH07XHJcbn07XHJcblxyXG5mdW5jdGlvbiBhZGROZXdTaGVkdWxlKGNoZWNrYm94Q29tcG9uZW50LCAkY29tcGlsZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiBcIkFFXCIsXHJcbiAgICBjb250cm9sbGVyOiAnc2hlZHVsZUN0cmwnLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgZGVmYXVsdERheXM6ICc9J1xyXG4gICAgfSxcclxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0cikge1xyXG4gICAgICBlbGVtLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZGF5c1Vuc2VsZWN0ID0gc2NvcGUuZGVmYXVsdERheXMudW5zZWxlY3RlZDtcclxuICAgICAgICB2YXIgZGF5c1J1ID0gc2NvcGUuZGVmYXVsdERheXMucnU7XHJcbiAgICAgICAgdmFyIGRheXNFbiA9IHNjb3BlLmRlZmF1bHREYXlzLmVuO1xyXG5cclxuICAgICAgICBpZihkYXlzVW5zZWxlY3QubGVuZ3RoID09PSAwKXsgcmV0dXJuIH07XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zaGVkdWxlcy1jaGlsZFwiKSk7IC8vIGZpbmQgY2hlY2tib3ggZmlyc3Qgcm93XHJcbiAgICAgICAgdmFyIGVsZW1DbG9uZSA9IGVsZW1lbnQuY2xvbmUoKTtcclxuICAgICAgICB2YXIgdW5jaGVja2VkID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGFkZC1mcmVlLWNoZWNrYm94PjwvZGl2PicpLmFkZENsYXNzKCdjaGVja2JveCcpO1xyXG4gICAgICAgIGVsZW1DbG9uZVswXS5xdWVyeVNlbGVjdG9yKCdbbmFtZT1cIndvcmt0aW1lT25lRnJvbVwiXScpLnJlcGxhY2VXaXRoKGNoZWNrYm94Q29tcG9uZW50LmlucHV0VGltZSgnd29ya3RpbWVPbmVGcm9tJylbMF0pOyAvLyBjcmVhdGUgaW5ucHV0ICh0aHJvdWdoIGZhY3RvcnkpIGFuZCByZXBsYWNlIG91ciBpbnB1dCB0aW1lXHJcbiAgICAgICAgZWxlbUNsb25lWzBdLnF1ZXJ5U2VsZWN0b3IoJ1tuYW1lPVwid29ya3RpbWVPbmVUb1wiXScpLnJlcGxhY2VXaXRoKGNoZWNrYm94Q29tcG9uZW50LmlucHV0VGltZSgnd29ya3RpbWVPbmVUbycpWzBdKTtcclxuICAgICAgICBlbGVtQ2xvbmVbMF0ucXVlcnlTZWxlY3RvcignLmNoZWNrYm94JylcclxuICAgICAgICAgIC5yZXBsYWNlV2l0aCh1bmNoZWNrZWRbMF0pOyAvLyByZXBsYWNlIG91ciBjaGVja2JveCBncm91cFxyXG4vLyBjcmVhdGUgY2xlYXIgY2hlY2tib3ggcm93XHJcbiAgICAgICAgZm9yKHZhciBpPTA7aTxkYXlzVW5zZWxlY3QubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgICB1bmNoZWNrZWQuYXBwZW5kKGNoZWNrYm94Q29tcG9uZW50LmJsb2NrKGRheXNVbnNlbGVjdFtpXSwgc2NvcGUuZGF5cykpO1xyXG4gICAgICAgIH1cclxuLy8gY3JlYXRlIGNsZWFyIGNoZWNrYm94IHJvd1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSBlbGVtZW50LnBhcmVudCgpO1xyXG4gICAgICAgIHBhcmVudC5hcHBlbmQoZWxlbUNsb25lWzBdKTsgY29uc29sZS5sb2coZWxlbUNsb25lLmVxKDApLmZpbmQoJ2lucHV0JykpO1xyXG4gICAgICAgIC8vICRjb21waWxlKGVsZW1DbG9uZSkoc2NvcGUpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59O1xyXG5hZGROZXdTaGVkdWxlLiRpbmplY3QgPSBbJ2NoZWNrYm94Q29tcG9uZW50JywgJyRjb21waWxlJ107XHJcblxyXG5mdW5jdGlvbiBhZGRGcmVlQ2hlY2tib3goY2hlY2tib3hDb21wb25lbnQpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbGluazoge1xyXG4gICAgICBwb3N0OiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIsIGN0cmwpIHtcclxuICAgICAgICAgIGVsZW0ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIHVuc2VsZWN0ZWQgPSBzY29wZS5kYXlzLnVuc2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgIHZhciBjaGVja2JveGVzID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jaGVja2JveCcpKTtcclxuICAgICAgICAgICAgZm9yKHZhciBpPTA7aTxjaGVja2JveGVzLmxlbmd0aDtpKyspe1xyXG4gICAgICAgICAgICAgIHZhciBpbnB1dCA9IGNoZWNrYm94ZXMuZXEoaSkuY2hpbGRyZW4oKS5maW5kKCdpbnB1dCcpO1xyXG4gICAgICAgICAgICAgIHZhciBjaGVja2JveCA9IFtdO1xyXG4gICAgICAgICAgICAgIGZvcihsZXQgaj0wO2o8aW5wdXQubGVuZ3RoO2orKyl7XHJcbiAgICAgICAgICAgICAgICBjaGVja2JveC5wdXNoKGlucHV0LmVxKGopLmF0dHIoJ25hbWUnKSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdW5zZWxlY3RlZC5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgaWYoY2hlY2tib3guaW5kZXhPZih1bnNlbGVjdGVkW2pdKSA9PT0gLTEpe1xyXG4gICAgICAgICAgICAgICAgICBjaGVja2JveGVzLmVxKGkpLmFwcGVuZChjaGVja2JveENvbXBvbmVudC5ibG9jayh1bnNlbGVjdGVkW2pdLCBzY29wZS5kYXlzKSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICBpZihhbmd1bGFyLmVsZW1lbnQoZS50YXJnZXQpLnByb3AoJ2NoZWNrZWQnKSl7XHJcbiAgICAgICAgICAgIC8vIGFuZ3VsYXIuZWxlbWVudChlLnRhcmdldCkuYXR0cignbmFtZScpXHJcbiAgICAgICAgICAgIGZvcih2YXIgaT0wO2k8Y2hlY2tib3hlcy5sZW5ndGg7aSsrKXtcclxuICAgICAgICAgICAgICB2YXIgaW5wdXQgPSBjaGVja2JveGVzLmVxKGkpLmNoaWxkcmVuKCkuZmluZCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgICBmb3IodmFyIGo9MDtqPGlucHV0Lmxlbmd0aDtqKyspe1xyXG4gICAgICAgICAgICAgICAgaWYoaW5wdXQuZXEoaikuYXR0cignbmFtZScpID09PSBhbmd1bGFyLmVsZW1lbnQoZS50YXJnZXQpLmF0dHIoJ25hbWUnKVxyXG4gICAgICAgICAgICAgICAgICAmJiAhaW5wdXQuZXEoaikucHJvcCgnY2hlY2tlZCcpKXtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dC5lcShqKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICBjaGVja2JveGVzLmVxKGkpLmNoaWxkcmVuKCkuZmluZCgnbGFiZWwnKS5lcShqKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBzY29wZS5kYXlzWyd1bnNlbGVjdGVkJ10uaW5kZXhPZihpbnB1dC5lcShqKS5hdHRyKCduYW1lJykpOyBjb25zb2xlLmxvZyhpbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGF5c1sndW5zZWxlY3RlZCddLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGF5c1snc2VsZWN0ZWQnXS5wdXNoKGlucHV0LmVxKGopLmF0dHIoJ25hbWUnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygoaW5wdXRbal0pLmF0dHIoJ25hbWUnKSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGFuZ3VsYXIuZWxlbWVudChlLnRhcmdldCkuYXR0cignbmFtZScpLCBhbmd1bGFyLmVsZW1lbnQoZS50YXJnZXQpLnByb3AoJ2NoZWNrZWQnKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICB9O1xyXG59O1xyXG5hZGRGcmVlQ2hlY2tib3guJGluamVjdCA9IFsnY2hlY2tib3hDb21wb25lbnQnXTtcclxuXHJcbmZ1bmN0aW9uIGRhdGVwaWNrZXIoKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICByZXF1aXJlOiAnbmdNb2RlbCcsXHJcbiAgICBzY29wZToge1xyXG4gICAgICBkYXRlOiAnPScsXHJcbiAgICAgIHZhbHVlOiAnPXZhbERhdGUnLFxyXG4gICAgICBtb2RlbDogJz1uZ01vZGVsJ1xyXG4gICAgfSxcclxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0ciwgbmdNb2RlbCkge1xyXG4gICAgICAgICBlbGVtLm9uKCdrZXl1cCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhuZ01vZGVsLiR2aWV3VmFsdWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbn07XHJcblxyXG5mdW5jdGlvbiB0aW1lcGlja2VyKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgcmVxdWlyZTogJ25nTW9kZWwnLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgdGltZTogJz0nLFxyXG4gICAgICBtb2RlbDogJz1uZ01vZGVsJ1xyXG4gICAgfSxcclxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0ciwgbmdNb2RlbCkge1xyXG4gICAgICAgIHZhciBkYXRhID0gbmV3IERhdGUobmV3IERhdGUoc2NvcGUudGltZSoxMDAwKS5nZXRUaW1lKCkpO1xyXG4gICAgICAgIHZhciB0aW1lID0gbW9tZW50KGRhdGEudG9TdHJpbmcoKSkuZm9ybWF0KCdISDpNTScpO1xyXG4gICAgICAgIG5nTW9kZWwuJHNldFZpZXdWYWx1ZSh0aW1lKTtcclxuICAgICAgICBuZ01vZGVsLiRyZW5kZXIoKTtcclxuXHJcbiAgICAgICAgIGVsZW0ub24oJ2tleXVwJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufTsiXSwiZmlsZSI6ImFwcC9zZWFzb24vc2hlZHVsZS9kaXJlY3RpdmVzLmpzIn0=
