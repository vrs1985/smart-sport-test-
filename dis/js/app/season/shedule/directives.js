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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAvc2Vhc29uL3NoZWR1bGUvZGlyZWN0aXZlcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBjaGVja2JveERheUxhYmVsKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogXCJBRVwiLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgaXRlbTogJz0nLFxyXG4gICAgICBkZWZhdWx0RGF5czogJz0nXHJcbiAgICB9LFxyXG4gICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtLCBhdHRyKSB7XHJcbiAgICAgIHZhciBpdGVtID0gc2NvcGUuaXRlbTtcclxuICAgICAgdmFyIGRheXMgPSBzY29wZS5kZWZhdWx0RGF5cztcclxuICAgICAgdmFyIGluZGV4ID0gZGF5c1snZW4nXS5pbmRleE9mKGl0ZW0pO1xyXG4gICAgICBlbGVtLmh0bWwoZGF5c1sncnUnXVtpbmRleF0pO1xyXG4gICAgICBkYXlzWydzZWxlY3RlZCddLnB1c2goZGF5cy5lbltpbmRleF0pO1xyXG4gICAgICBkYXlzWyd1bnNlbGVjdGVkJ10uc3BsaWNlKGRheXNbJ3Vuc2VsZWN0ZWQnXS5pbmRleE9mKGl0ZW0pLCAxKTtcclxuICAgIH1cclxuICB9O1xyXG59O1xyXG5cclxuZnVuY3Rpb24gY2hlY2tib3hEYXlJbnB1dCgpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6IFwiQUVcIixcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGl0ZW06ICc9JyxcclxuICAgICAgZGVmYXVsdERheXM6ICc9J1xyXG4gICAgfSxcclxuICAgIGxpbms6IHtcclxuICAgIHByZTogZnVuY3Rpb24gKHNjb3BlLCBlbGVtLCBhdHRyLCBjdHJsKSB7XHJcbiAgICB9LFxyXG4gICAgcG9zdDogZnVuY3Rpb24gKHNjb3BlLCBlbGVtLCBhdHRyKXtcclxuICAgICAgdmFyIGl0ZW0gPSBzY29wZS5pdGVtO1xyXG4gICAgICB2YXIgZGF5cyA9IHNjb3BlLmRlZmF1bHREYXlzO1xyXG4vLyBjcmVhdGUgZW1wdHkgY2hlY2tib3hcclxuICAgICAgICBlbGVtLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgaW5kZXggPSBkYXlzWydzZWxlY3RlZCddLmluZGV4T2YoaXRlbSk7XHJcbiAgICAgICAgaWYoZWxlbVswXS5jaGVja2VkKXtcclxuICAgICAgICAgIGRheXNbJ3NlbGVjdGVkJ10ucHVzaChzY29wZS5pdGVtKTtcclxuICAgICAgICAgIGRheXNbJ3Vuc2VsZWN0ZWQnXS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgZGF5c1snc2VsZWN0ZWQnXS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgZGF5c1sndW5zZWxlY3RlZCddLnB1c2goc2NvcGUuaXRlbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KHNjb3BlLmRlZmF1bHREYXlzLnNlbGVjdGVkLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYSAtIGI7XHJcbiAgICAgICAgfSkpO1xyXG4gICAgICB9KTtcclxuLy8gY3JlYXRlIGVtcHR5IGNoZWNrYm94XHJcbiAgICB9XHJcblxyXG4gICAgfVxyXG4gIH07XHJcbn07XHJcblxyXG5mdW5jdGlvbiBhZGROZXdTaGVkdWxlKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiBcIkFFXCIsXHJcbiAgICBjb250cm9sbGVyOiAnc2hlZHVsZUN0cmwnLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgZGVmYXVsdERheXM6ICc9J1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiAnLi4vdGVtcGxhdGVzL3NoZWR1bGUtcm93Lmh0bWwnLFxyXG4gICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtLCBhdHRyKSB7XHJcbiAgICAgIGVsZW0ub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIGlmKGRheXMubGVuZ3RoID09PSAwKXsgcmV0dXJuIH1cclxuICAgICAgICB2YXIgdGVtcCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2VtcHR5Q2hlY2tib3hSb3dcIikpO1xyXG4gICAgICAgIHZhciB0ZW1wQ2xvbmUgPSB0ZW1wLmNsb25lKCk7XHJcbiAgICAgICAgdmFyIG9sZGVsZW0gPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zaGVkdWxlcy1jaGlsZFwiKSk7XHJcbiAgICAgICAgb2xkZWxlbS5wYXJlbnQoKS5hcHBlbmQodGVtcENsb25lKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufTtcclxuXHJcblxyXG5mdW5jdGlvbiBkYXRlcGlja2VyKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgcmVxdWlyZTogJ25nTW9kZWwnLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgZGF0ZTogJz0nLFxyXG4gICAgICB2YWx1ZTogJz12YWxEYXRlJyxcclxuICAgICAgbW9kZWw6ICc9bmdNb2RlbCdcclxuICAgIH0sXHJcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIsIG5nTW9kZWwpIHtcclxuICAgICAgICAgZWxlbS5vbigna2V5dXAnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobmdNb2RlbC4kdmlld1ZhbHVlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59O1xyXG5cclxuZnVuY3Rpb24gdGltZXBpY2tlcigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIHRpbWU6ICc9JyxcclxuICAgICAgbW9kZWw6ICc9bmdNb2RlbCdcclxuICAgIH0sXHJcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIsIG5nTW9kZWwpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IG5ldyBEYXRlKG5ldyBEYXRlKHNjb3BlLnRpbWUqMTAwMCkuZ2V0VGltZSgpKTtcclxuICAgICAgICB2YXIgdGltZSA9IG1vbWVudChkYXRhLnRvU3RyaW5nKCkpLmZvcm1hdCgnSEg6TU0nKTtcclxuICAgICAgICBuZ01vZGVsLiRzZXRWaWV3VmFsdWUodGltZSk7XHJcbiAgICAgICAgbmdNb2RlbC4kcmVuZGVyKCk7XHJcblxyXG4gICAgICAgICBlbGVtLm9uKCdrZXl1cCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbn07Il0sImZpbGUiOiJhcHAvc2Vhc29uL3NoZWR1bGUvZGlyZWN0aXZlcy5qcyJ9
