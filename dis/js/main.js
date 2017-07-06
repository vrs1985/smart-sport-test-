
/* ========================================================================
 * Bootstrap: collapse.js v3.3.7
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */

+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.7'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);
/* ========================================================================
 * Bootstrap: transition.js v3.3.7
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);
/* assets/datepicker.js*/

'use strict'
var smartsport = angular.module('smartsport', [
  'ngRoute',
  'smartsport.season'
  ])
  .config(ConfApp)
  .controller('MainCtrl', MainCtrl)
  .directive("headerSmartsport", Header)
  .directive("footerSmartsport", Footer);

smartsport.run(function(seasonData) {
  seasonData;
    // var seasonData = $localstorage.getObject('seasonData');
});

  function ConfApp($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({redirectTo:'/'});
  }
  ConfApp.$inject = ['$routeProvider', '$locationProvider'];

  function MainCtrl($scope, $http) {

  }

  MainCtrl.$inject = ['$scope', '$http'];

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
function Header() {
  return{
    restrict: "E",
    templateUrl: "../../templates/header.html",
    replace: true
  }
};

function Footer() {
  return{
    restrict: "E",
    templateUrl: "../../templates/footer.html",
    replace: true
  }
}

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
.directive("addNewShedule", addNewShedule);


function SeasonPageCtrl($scope, $http) {
    $http.get("../data/data.json")
    .then(function (response) { $scope.data = response.data.records;
   });
}

SeasonPageCtrl.$inject = ['$scope', '$http'];
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

function progressSeason() {
  return {
    restrict: "E",
    templateUrl: "../templates/progress-bar.html",
    controller: 'progressCtrl',
    replace: true
  };
};

function sheduleSeason() {
  return {
    restrict: "E",
    templateUrl: "../templates/shedule.html",
    controller: 'sheduleCtrl',
    replace: true
  };
};

function categoriesSeason() {
  return {
    restrict: "E",
    templateUrl: "../templates/categories.html",
    controller: 'categoriesCtrl',
    replace: true
  };
};

function bathroomsSeason() {
  return {
    restrict: "E",
    templateUrl: "../templates/bathrooms.html",
    controller: 'bathroomsCtrl',
    replace: true
  };
};

function pricesSeason() {
  return {
    restrict: "E",
    templateUrl: "../templates/prices.html",
    controller: 'pricesCtrl',
    replace: true
  };
};

function fullPriceSeason() {
  return {
    restrict: "E",
    templateUrl: "../templates/full-price.html",
    controller: 'fullPriceCtrl',
    replace: true
  };
};

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

season.factory('sheduleRowEmpty', function () {
  return {
    addCheckbox: function (unchecked) {
      var dayRu = { "mon": "Пн", "tue": "Вт", "wed": "Ср", "thu": "Чт", "fri": "Пт", "sat": "Сб", "sun": "Вс" };
      var span = angular.element('span');
      for(let j=0;j<unchecked.length; j++){
        // for input
        var input = angular.element('<input />'); console.log(input);
        var inputAttr = ['form-control', 'checkbox-day-input'];
        for(let i=0; i<inputAttr.length; i++){
          input.addClass(inputAttr[i]);
        }
        // for input
        // for label
        var label = angular.element('label'); console.log(label);
        label.text(dayRu[unchecked[j]]);
        // for label
        span.append(label);
        span.append(input);
      }
      // var targetEl = find(document.querySelector('.checkbox'));
      console.log(targetEl);
      // targetEl.append(span);

    }
  };
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBjb2xsYXBzZS5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jY29sbGFwc2VcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcbi8qIGpzaGludCBsYXRlZGVmOiBmYWxzZSAqL1xyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBDT0xMQVBTRSBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBDb2xsYXBzZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50ICAgICAgPSAkKGVsZW1lbnQpXHJcbiAgICB0aGlzLm9wdGlvbnMgICAgICAgPSAkLmV4dGVuZCh7fSwgQ29sbGFwc2UuREVGQVVMVFMsIG9wdGlvbnMpXHJcbiAgICB0aGlzLiR0cmlnZ2VyICAgICAgPSAkKCdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXVtocmVmPVwiIycgKyBlbGVtZW50LmlkICsgJ1wiXSwnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdW2RhdGEtdGFyZ2V0PVwiIycgKyBlbGVtZW50LmlkICsgJ1wiXScpXHJcbiAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSBudWxsXHJcblxyXG4gICAgaWYgKHRoaXMub3B0aW9ucy5wYXJlbnQpIHtcclxuICAgICAgdGhpcy4kcGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5hZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3ModGhpcy4kZWxlbWVudCwgdGhpcy4kdHJpZ2dlcilcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5vcHRpb25zLnRvZ2dsZSkgdGhpcy50b2dnbGUoKVxyXG4gIH1cclxuXHJcbiAgQ29sbGFwc2UuVkVSU0lPTiAgPSAnMy4zLjcnXHJcblxyXG4gIENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04gPSAzNTBcclxuXHJcbiAgQ29sbGFwc2UuREVGQVVMVFMgPSB7XHJcbiAgICB0b2dnbGU6IHRydWVcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS5kaW1lbnNpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgaGFzV2lkdGggPSB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCd3aWR0aCcpXHJcbiAgICByZXR1cm4gaGFzV2lkdGggPyAnd2lkdGgnIDogJ2hlaWdodCdcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMudHJhbnNpdGlvbmluZyB8fCB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpbicpKSByZXR1cm5cclxuXHJcbiAgICB2YXIgYWN0aXZlc0RhdGFcclxuICAgIHZhciBhY3RpdmVzID0gdGhpcy4kcGFyZW50ICYmIHRoaXMuJHBhcmVudC5jaGlsZHJlbignLnBhbmVsJykuY2hpbGRyZW4oJy5pbiwgLmNvbGxhcHNpbmcnKVxyXG5cclxuICAgIGlmIChhY3RpdmVzICYmIGFjdGl2ZXMubGVuZ3RoKSB7XHJcbiAgICAgIGFjdGl2ZXNEYXRhID0gYWN0aXZlcy5kYXRhKCdicy5jb2xsYXBzZScpXHJcbiAgICAgIGlmIChhY3RpdmVzRGF0YSAmJiBhY3RpdmVzRGF0YS50cmFuc2l0aW9uaW5nKSByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc3RhcnRFdmVudCA9ICQuRXZlbnQoJ3Nob3cuYnMuY29sbGFwc2UnKVxyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKHN0YXJ0RXZlbnQpXHJcbiAgICBpZiAoc3RhcnRFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgaWYgKGFjdGl2ZXMgJiYgYWN0aXZlcy5sZW5ndGgpIHtcclxuICAgICAgUGx1Z2luLmNhbGwoYWN0aXZlcywgJ2hpZGUnKVxyXG4gICAgICBhY3RpdmVzRGF0YSB8fCBhY3RpdmVzLmRhdGEoJ2JzLmNvbGxhcHNlJywgbnVsbClcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZGltZW5zaW9uID0gdGhpcy5kaW1lbnNpb24oKVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzZScpXHJcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpW2RpbWVuc2lvbl0oMClcclxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxyXG5cclxuICAgIHRoaXMuJHRyaWdnZXJcclxuICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzZWQnKVxyXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXHJcblxyXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMVxyXG5cclxuICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2luZycpXHJcbiAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZSBpbicpW2RpbWVuc2lvbl0oJycpXHJcbiAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDBcclxuICAgICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAgIC50cmlnZ2VyKCdzaG93bi5icy5jb2xsYXBzZScpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuIGNvbXBsZXRlLmNhbGwodGhpcylcclxuXHJcbiAgICB2YXIgc2Nyb2xsU2l6ZSA9ICQuY2FtZWxDYXNlKFsnc2Nyb2xsJywgZGltZW5zaW9uXS5qb2luKCctJykpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCAkLnByb3h5KGNvbXBsZXRlLCB0aGlzKSlcclxuICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04pW2RpbWVuc2lvbl0odGhpcy4kZWxlbWVudFswXVtzY3JvbGxTaXplXSlcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMudHJhbnNpdGlvbmluZyB8fCAhdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSkgcmV0dXJuXHJcblxyXG4gICAgdmFyIHN0YXJ0RXZlbnQgPSAkLkV2ZW50KCdoaWRlLmJzLmNvbGxhcHNlJylcclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzdGFydEV2ZW50KVxyXG4gICAgaWYgKHN0YXJ0RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgIHZhciBkaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbigpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudFtkaW1lbnNpb25dKHRoaXMuJGVsZW1lbnRbZGltZW5zaW9uXSgpKVswXS5vZmZzZXRIZWlnaHRcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpXHJcbiAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2UgaW4nKVxyXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxyXG5cclxuICAgIHRoaXMuJHRyaWdnZXJcclxuICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZWQnKVxyXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxyXG5cclxuICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDFcclxuXHJcbiAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDBcclxuICAgICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2luZycpXHJcbiAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZScpXHJcbiAgICAgICAgLnRyaWdnZXIoJ2hpZGRlbi5icy5jb2xsYXBzZScpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuIGNvbXBsZXRlLmNhbGwodGhpcylcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgIFtkaW1lbnNpb25dKDApXHJcbiAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsICQucHJveHkoY29tcGxldGUsIHRoaXMpKVxyXG4gICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoQ29sbGFwc2UuVFJBTlNJVElPTl9EVVJBVElPTilcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzW3RoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykgPyAnaGlkZScgOiAnc2hvdyddKClcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS5nZXRQYXJlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gJCh0aGlzLm9wdGlvbnMucGFyZW50KVxyXG4gICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl1bZGF0YS1wYXJlbnQ9XCInICsgdGhpcy5vcHRpb25zLnBhcmVudCArICdcIl0nKVxyXG4gICAgICAuZWFjaCgkLnByb3h5KGZ1bmN0aW9uIChpLCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KVxyXG4gICAgICAgIHRoaXMuYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzKGdldFRhcmdldEZyb21UcmlnZ2VyKCRlbGVtZW50KSwgJGVsZW1lbnQpXHJcbiAgICAgIH0sIHRoaXMpKVxyXG4gICAgICAuZW5kKClcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS5hZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3MgPSBmdW5jdGlvbiAoJGVsZW1lbnQsICR0cmlnZ2VyKSB7XHJcbiAgICB2YXIgaXNPcGVuID0gJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJylcclxuXHJcbiAgICAkZWxlbWVudC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgaXNPcGVuKVxyXG4gICAgJHRyaWdnZXJcclxuICAgICAgLnRvZ2dsZUNsYXNzKCdjb2xsYXBzZWQnLCAhaXNPcGVuKVxyXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGlzT3BlbilcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFRhcmdldEZyb21UcmlnZ2VyKCR0cmlnZ2VyKSB7XHJcbiAgICB2YXIgaHJlZlxyXG4gICAgdmFyIHRhcmdldCA9ICR0cmlnZ2VyLmF0dHIoJ2RhdGEtdGFyZ2V0JylcclxuICAgICAgfHwgKGhyZWYgPSAkdHJpZ2dlci5hdHRyKCdocmVmJykpICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpIC8vIHN0cmlwIGZvciBpZTdcclxuXHJcbiAgICByZXR1cm4gJCh0YXJnZXQpXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQ09MTEFQU0UgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMuY29sbGFwc2UnKVxyXG4gICAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBDb2xsYXBzZS5ERUZBVUxUUywgJHRoaXMuZGF0YSgpLCB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvbilcclxuXHJcbiAgICAgIGlmICghZGF0YSAmJiBvcHRpb25zLnRvZ2dsZSAmJiAvc2hvd3xoaWRlLy50ZXN0KG9wdGlvbikpIG9wdGlvbnMudG9nZ2xlID0gZmFsc2VcclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5jb2xsYXBzZScsIChkYXRhID0gbmV3IENvbGxhcHNlKHRoaXMsIG9wdGlvbnMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4uY29sbGFwc2VcclxuXHJcbiAgJC5mbi5jb2xsYXBzZSAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4uY29sbGFwc2UuQ29uc3RydWN0b3IgPSBDb2xsYXBzZVxyXG5cclxuXHJcbiAgLy8gQ09MTEFQU0UgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLmNvbGxhcHNlLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLmNvbGxhcHNlID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIENPTExBUFNFIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmJzLmNvbGxhcHNlLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG5cclxuICAgIGlmICghJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKSkgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICAgdmFyICR0YXJnZXQgPSBnZXRUYXJnZXRGcm9tVHJpZ2dlcigkdGhpcylcclxuICAgIHZhciBkYXRhICAgID0gJHRhcmdldC5kYXRhKCdicy5jb2xsYXBzZScpXHJcbiAgICB2YXIgb3B0aW9uICA9IGRhdGEgPyAndG9nZ2xlJyA6ICR0aGlzLmRhdGEoKVxyXG5cclxuICAgIFBsdWdpbi5jYWxsKCR0YXJnZXQsIG9wdGlvbilcclxuICB9KVxyXG5cclxufShqUXVlcnkpO1xyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiB0cmFuc2l0aW9uLmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0cmFuc2l0aW9uc1xyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gQ1NTIFRSQU5TSVRJT04gU1VQUE9SVCAoU2hvdXRvdXQ6IGh0dHA6Ly93d3cubW9kZXJuaXpyLmNvbS8pXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIHRyYW5zaXRpb25FbmQoKSB7XHJcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdib290c3RyYXAnKVxyXG5cclxuICAgIHZhciB0cmFuc0VuZEV2ZW50TmFtZXMgPSB7XHJcbiAgICAgIFdlYmtpdFRyYW5zaXRpb24gOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXHJcbiAgICAgIE1velRyYW5zaXRpb24gICAgOiAndHJhbnNpdGlvbmVuZCcsXHJcbiAgICAgIE9UcmFuc2l0aW9uICAgICAgOiAnb1RyYW5zaXRpb25FbmQgb3RyYW5zaXRpb25lbmQnLFxyXG4gICAgICB0cmFuc2l0aW9uICAgICAgIDogJ3RyYW5zaXRpb25lbmQnXHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgbmFtZSBpbiB0cmFuc0VuZEV2ZW50TmFtZXMpIHtcclxuICAgICAgaWYgKGVsLnN0eWxlW25hbWVdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4geyBlbmQ6IHRyYW5zRW5kRXZlbnROYW1lc1tuYW1lXSB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2UgLy8gZXhwbGljaXQgZm9yIGllOCAoICAuXy4pXHJcbiAgfVxyXG5cclxuICAvLyBodHRwOi8vYmxvZy5hbGV4bWFjY2F3LmNvbS9jc3MtdHJhbnNpdGlvbnNcclxuICAkLmZuLmVtdWxhdGVUcmFuc2l0aW9uRW5kID0gZnVuY3Rpb24gKGR1cmF0aW9uKSB7XHJcbiAgICB2YXIgY2FsbGVkID0gZmFsc2VcclxuICAgIHZhciAkZWwgPSB0aGlzXHJcbiAgICAkKHRoaXMpLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgZnVuY3Rpb24gKCkgeyBjYWxsZWQgPSB0cnVlIH0pXHJcbiAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7IGlmICghY2FsbGVkKSAkKCRlbCkudHJpZ2dlcigkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQpIH1cclxuICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIGR1cmF0aW9uKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gICQoZnVuY3Rpb24gKCkge1xyXG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gPSB0cmFuc2l0aW9uRW5kKClcclxuXHJcbiAgICBpZiAoISQuc3VwcG9ydC50cmFuc2l0aW9uKSByZXR1cm5cclxuXHJcbiAgICAkLmV2ZW50LnNwZWNpYWwuYnNUcmFuc2l0aW9uRW5kID0ge1xyXG4gICAgICBiaW5kVHlwZTogJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLFxyXG4gICAgICBkZWxlZ2F0ZVR5cGU6ICQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxcclxuICAgICAgaGFuZGxlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGlmICgkKGUudGFyZ2V0KS5pcyh0aGlzKSkgcmV0dXJuIGUuaGFuZGxlT2JqLmhhbmRsZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSlcclxuXHJcbn0oalF1ZXJ5KTtcclxuLyogYXNzZXRzL2RhdGVwaWNrZXIuanMqL1xyXG5cclxuJ3VzZSBzdHJpY3QnXHJcbnZhciBzbWFydHNwb3J0ID0gYW5ndWxhci5tb2R1bGUoJ3NtYXJ0c3BvcnQnLCBbXHJcbiAgJ25nUm91dGUnLFxyXG4gICdzbWFydHNwb3J0LnNlYXNvbidcclxuICBdKVxyXG4gIC5jb25maWcoQ29uZkFwcClcclxuICAuY29udHJvbGxlcignTWFpbkN0cmwnLCBNYWluQ3RybClcclxuICAuZGlyZWN0aXZlKFwiaGVhZGVyU21hcnRzcG9ydFwiLCBIZWFkZXIpXHJcbiAgLmRpcmVjdGl2ZShcImZvb3RlclNtYXJ0c3BvcnRcIiwgRm9vdGVyKTtcclxuXHJcbnNtYXJ0c3BvcnQucnVuKGZ1bmN0aW9uKHNlYXNvbkRhdGEpIHtcclxuICBzZWFzb25EYXRhO1xyXG4gICAgLy8gdmFyIHNlYXNvbkRhdGEgPSAkbG9jYWxzdG9yYWdlLmdldE9iamVjdCgnc2Vhc29uRGF0YScpO1xyXG59KTtcclxuXHJcbiAgZnVuY3Rpb24gQ29uZkFwcCgkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcclxuICAgICRsb2NhdGlvblByb3ZpZGVyLmhhc2hQcmVmaXgoJyEnKTtcclxuICAgICRyb3V0ZVByb3ZpZGVyLm90aGVyd2lzZSh7cmVkaXJlY3RUbzonLyd9KTtcclxuICB9XHJcbiAgQ29uZkFwcC4kaW5qZWN0ID0gWyckcm91dGVQcm92aWRlcicsICckbG9jYXRpb25Qcm92aWRlciddO1xyXG5cclxuICBmdW5jdGlvbiBNYWluQ3RybCgkc2NvcGUsICRodHRwKSB7XHJcblxyXG4gIH1cclxuXHJcbiAgTWFpbkN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRodHRwJ107XHJcblxyXG5zbWFydHNwb3J0LmZhY3RvcnkoJyRsb2NhbHN0b3JhZ2UnLCBbJyR3aW5kb3cnLCBmdW5jdGlvbigkd2luZG93KSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG4gICAgICAkd2luZG93LmxvY2FsU3RvcmFnZVtrZXldID0gdmFsdWU7XHJcbiAgICB9LFxyXG4gICAgZ2V0OiBmdW5jdGlvbihrZXksIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgICByZXR1cm4gJHdpbmRvdy5sb2NhbFN0b3JhZ2Vba2V5XSB8fCBkZWZhdWx0VmFsdWU7XHJcbiAgICB9LFxyXG4gICAgc2V0T2JqZWN0OiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlW2tleV0gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0T2JqZWN0OiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2Vba2V5XSB8fCAnW10nKTtcclxuICAgIH1cclxuICB9XHJcbn1dKTtcclxuXHJcbnNtYXJ0c3BvcnQuZmFjdG9yeSgnc2Vhc29uRGF0YScsIFsnJHJvb3RTY29wZScsICckaHR0cCcsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkaHR0cCkge1xyXG4gIHZhciBkYXRhID0ge1xyXG4gICAgZGF0YTogW11cclxuICB9O1xyXG4gICAgICAkaHR0cC5nZXQoXCIuLi9kYXRhL2RhdGEuanNvblwiKVxyXG4gICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7ICBkYXRhLmRhdGEgPSByZXNwb25zZS5kYXRhLnJlY29yZHM7XHJcbiAgICAgICRyb290U2NvcGUuZGF0YSA9IGRhdGEuZGF0YTtcclxuICAgfSk7XHJcbiAgICByZXR1cm4gZGF0YS5kYXRhO1xyXG59XSk7XHJcblxyXG5zbWFydHNwb3J0LmZhY3RvcnkoJ2NvbnZlcnRUaW1lJywgZnVuY3Rpb24gKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0aW1lVG9NczogZnVuY3Rpb24gKHRpbWUpIHtcclxuXHJcbiAgICAgIHJldHVybiA7XHJcbiAgICB9LFxyXG4gICAgbXNUb1RpbWU6IGZ1bmN0aW9uIChtcykge1xyXG4gICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKG5ldyBEYXRlKG1zKjEwMDApLmdldFRpbWUoKSk7XHJcbiAgICAgIHZhciB0aW1lID0gbW9tZW50KGRhdGUudG9TdHJpbmcoKSkuZm9ybWF0KCdISDpNTScpO1xyXG4gICAgICByZXR1cm4gdGltZTtcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbnNtYXJ0c3BvcnQuZmFjdG9yeSgnY2hlY2tlZERheXMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIHtcclxuXHJcbiAgfVxyXG59KTtcclxuZnVuY3Rpb24gSGVhZGVyKCkge1xyXG4gIHJldHVybntcclxuICAgIHJlc3RyaWN0OiBcIkVcIixcclxuICAgIHRlbXBsYXRlVXJsOiBcIi4uLy4uL3RlbXBsYXRlcy9oZWFkZXIuaHRtbFwiLFxyXG4gICAgcmVwbGFjZTogdHJ1ZVxyXG4gIH1cclxufTtcclxuXHJcbmZ1bmN0aW9uIEZvb3RlcigpIHtcclxuICByZXR1cm57XHJcbiAgICByZXN0cmljdDogXCJFXCIsXHJcbiAgICB0ZW1wbGF0ZVVybDogXCIuLi8uLi90ZW1wbGF0ZXMvZm9vdGVyLmh0bWxcIixcclxuICAgIHJlcGxhY2U6IHRydWVcclxuICB9XHJcbn1cclxuXHJcbnZhciBzZWFzb24gPSBhbmd1bGFyLm1vZHVsZShcInNtYXJ0c3BvcnQuc2Vhc29uXCIsIFtcclxuICAnbmdSb3V0ZScsXHJcbiAgJ3NtYXJ0c3BvcnQnLFxyXG4gIF0pXHJcbi5jb250cm9sbGVyKFwiU2Vhc29uUGFnZUN0cmxcIiwgU2Vhc29uUGFnZUN0cmwpXHJcbi5kaXJlY3RpdmUoXCJwcm9ncmVzc1NlYXNvblwiLCBwcm9ncmVzc1NlYXNvbilcclxuLmRpcmVjdGl2ZShcInNoZWR1bGVTZWFzb25cIiwgc2hlZHVsZVNlYXNvbilcclxuLmRpcmVjdGl2ZShcImNhdGVnb3JpZXNTZWFzb25cIiwgY2F0ZWdvcmllc1NlYXNvbilcclxuLmRpcmVjdGl2ZShcImJhdGhyb29tc1NlYXNvblwiLCBiYXRocm9vbXNTZWFzb24pXHJcbi5kaXJlY3RpdmUoXCJwcmljZXNTZWFzb25cIiwgcHJpY2VzU2Vhc29uKVxyXG4uZGlyZWN0aXZlKFwiZnVsbFByaWNlU2Vhc29uXCIsIGZ1bGxQcmljZVNlYXNvbilcclxuLmRpcmVjdGl2ZShcImRhdGVwaWNrZXJcIiwgZGF0ZXBpY2tlcilcclxuLmRpcmVjdGl2ZShcImNoZWNrYm94RGF5TGFiZWxcIiwgY2hlY2tib3hEYXlMYWJlbClcclxuLmRpcmVjdGl2ZShcImNoZWNrYm94RGF5SW5wdXRcIiwgY2hlY2tib3hEYXlJbnB1dClcclxuLmRpcmVjdGl2ZShcInRpbWVwaWNrZXJcIiwgdGltZXBpY2tlcilcclxuLmRpcmVjdGl2ZShcImFkZE5ld1NoZWR1bGVcIiwgYWRkTmV3U2hlZHVsZSk7XHJcblxyXG5cclxuZnVuY3Rpb24gU2Vhc29uUGFnZUN0cmwoJHNjb3BlLCAkaHR0cCkge1xyXG4gICAgJGh0dHAuZ2V0KFwiLi4vZGF0YS9kYXRhLmpzb25cIilcclxuICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkgeyAkc2NvcGUuZGF0YSA9IHJlc3BvbnNlLmRhdGEucmVjb3JkcztcclxuICAgfSk7XHJcbn1cclxuXHJcblNlYXNvblBhZ2VDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckaHR0cCddO1xyXG5zZWFzb24uY29udHJvbGxlcigncHJvZ3Jlc3NDdHJsJywgUHJvZ3Jlc3NDdHJsKTtcclxuZnVuY3Rpb24gUHJvZ3Jlc3NDdHJsKCRzY29wZSwgJGh0dHAsICRyb290U2NvcGUpIHtcclxuICB2YXIgZGF0YSA9ICRyb290U2NvcGUuZGF0YVswXS5wcm9ncmVzcztcclxuICAkc2NvcGUuc3ZnID0ge1xyXG4gICAgZmlsZTogWydpbWFnZXMvcHJvZ3Jlc3MtYmFyLTEuc3ZnJywgJ2ltYWdlcy9wcm9ncmVzcy1iYXItMi5zdmcnXSxcclxuICAgIHByb2dyZXNzOmRhdGFcclxuICB9O1xyXG59XHJcblByb2dyZXNzQ3RybC4kaW5qZWN0b3IgPSBbJyRzY29wZScsICckaHR0cCcsICckcm9vdFNjb3BlJ107XHJcblxyXG5zZWFzb24uY29udHJvbGxlcignc2hlZHVsZUN0cmwnLCBTaGVkdWxlQ3RybCk7XHJcbmZ1bmN0aW9uIFNoZWR1bGVDdHJsKGNvbnZlcnRUaW1lLCAkcm9vdFNjb3BlLCAkc2NvcGUsICRodHRwLCAkZmlsdGVyKSB7XHJcbiRzY29wZS5zZWFzb25zID0gJHJvb3RTY29wZS5kYXRhWzFdLnNlYXNvbnM7XHJcblxyXG4kc2NvcGUuZGF5cz17XHJcbiAgZW46IFtcIm1vblwiLCBcInR1ZVwiLCBcIndlZFwiLCBcInRodVwiLCBcImZyaVwiLCBcInNhdFwiLCBcInN1blwiXSxcclxuICBydTogW1wi0J/QvVwiLCBcItCS0YJcIiwgXCLQodGAXCIsIFwi0KfRglwiLCBcItCf0YJcIiwgXCLQodCxXCIsIFwi0JLRgVwiXSxcclxuICBzZWxlY3RlZDogW10sXHJcbiAgdW5zZWxlY3RlZDogW1wibW9uXCIsIFwidHVlXCIsIFwid2VkXCIsIFwidGh1XCIsIFwiZnJpXCIsIFwic2F0XCIsIFwic3VuXCJdXHJcbn07XHJcblxyXG4kc2NvcGUuZGVmRGF0ZSA9IHtcclxuICBub3c6IG5ldyBEYXRlKClcclxufTtcclxuXHJcbn1cclxuU2hlZHVsZUN0cmwuJGluamVjdG9yID0gWydjb252ZXJ0VGltZScsICckcm9vdFNjb3BlJywgJyRodHRwJywgJyRzY29wZScsICckZmlsdGVyJ107XHJcblxyXG5cclxuc2Vhc29uLmNvbnRyb2xsZXIoJ2NhdGVnb3JpZXNDdHJsJywgQ2F0ZWdvcmllc0N0cmwpO1xyXG5mdW5jdGlvbiBDYXRlZ29yaWVzQ3RybCgkcm9vdFNjb3BlLCAkc2NvcGUsICRodHRwKSB7XHJcbiAgdmFyIGRhdGEgPSAkcm9vdFNjb3BlLmRhdGFbMl0uY2F0ZWdvcmllcztcclxuXHJcbiAgJHNjb3BlLmNhdGVnb3JpZXMgPSBkYXRhO1xyXG5cclxuICAkc2NvcGUucmVtb3ZlID0gZnVuY3Rpb24gKGlkKSB7IC8vINGD0LTQsNC70Y/QtdC8INC60LDRgtC10LPQvtGA0LjRjlxyXG4gICAgJHJvb3RTY29wZS5kYXRhWzJdLmNhdGVnb3JpZXMuc3BsaWNlKGlkLCAxKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5hZGQgPSBmdW5jdGlvbiAoY291bnRyeSkgeyAvLyDQtNC+0LHQsNCy0LvRj9C10Lwg0LrQsNGC0LXQs9C+0YDQuNGOXHJcbiAgICB2YXIgY2F0ZWdvcnkgPSBkYXRhO1xyXG4gICAgY2F0ZWdvcnkucHVzaChjb3VudHJ5KTtcclxuICAgICRyb290U2NvcGUuZGF0YVsyXS5jYXRlZ29yaWVzID0gY2F0ZWdvcnk7XHJcbiAgfVxyXG5cclxufVxyXG5DYXRlZ29yaWVzQ3RybC4kaW5qZWN0b3IgPSBbJyRyb290U2NvcGUnLCAnJGh0dHAnLCAnJHNjb3BlJ107XHJcblxyXG5zZWFzb24uY29udHJvbGxlcignYmF0aHJvb21zQ3RybCcsIEJhdGhyb29tc0N0cmwpO1xyXG5mdW5jdGlvbiBCYXRocm9vbXNDdHJsKCRzY29wZSwgJGh0dHApIHtcclxuXHJcbn1cclxuQmF0aHJvb21zQ3RybC4kaW5qZWN0b3IgPSBbJyRzY29wZScsICckaHR0cCddO1xyXG5cclxuc2Vhc29uLmNvbnRyb2xsZXIoJ3ByaWNlc0N0cmwnLCBQcmljZXNDdHJsKTtcclxuZnVuY3Rpb24gUHJpY2VzQ3RybCgkc2NvcGUsICRodHRwKSB7XHJcblxyXG59XHJcblByaWNlc0N0cmwuJGluamVjdG9yID0gWyckc2NvcGUnLCAnJGh0dHAnXTtcclxuXHJcbnNlYXNvbi5jb250cm9sbGVyKCdmdWxsUHJpY2VDdHJsJywgRnVsbFByaWNlQ3RybCk7XHJcbmZ1bmN0aW9uIEZ1bGxQcmljZUN0cmwoJHNjb3BlLCAkaHR0cCkge1xyXG4gICRzY29wZS5mdWxsUHJpY2UgPSBmYWxzZTtcclxuXHJcbn1cclxuRnVsbFByaWNlQ3RybC4kaW5qZWN0b3IgPSBbJyRzY29wZScsICckaHR0cCddO1xyXG5cclxuXHJcbnNlYXNvbi5jb250cm9sbGVyKCdkYXRlcGlja2VyQ3RybCcsIERhdGVwaWNrZXJDdHJsKTtcclxuZnVuY3Rpb24gRGF0ZXBpY2tlckN0cmwoJHJvb3RTY29wZSwgJHNjb3BlKSB7XHJcbiAgJHNjb3BlLnNlYXNvbnMgPSAkcm9vdFNjb3BlLmRhdGFbMF0uc2Vhc29ucztcclxuXHJcbn1cclxuRGF0ZXBpY2tlckN0cmwuJGluamVjdG9yID0gWyckcm9vdFNjb3BlJywgJyRzY29wZSddO1xyXG5cclxuXHJcbnNlYXNvbi5jb250cm9sbGVyKCd0aW1lcGlja2VyQ3RybCcsIFRpbWVwaWNrZXJDdHJsKTtcclxuZnVuY3Rpb24gVGltZXBpY2tlckN0cmwoJHNjb3BlKSB7XHJcblxyXG59XHJcblRpbWVwaWNrZXJDdHJsLiRpbmplY3RvciA9IFsnJHNjb3BlJ107XHJcblxyXG5mdW5jdGlvbiBwcm9ncmVzc1NlYXNvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxyXG4gICAgdGVtcGxhdGVVcmw6IFwiLi4vdGVtcGxhdGVzL3Byb2dyZXNzLWJhci5odG1sXCIsXHJcbiAgICBjb250cm9sbGVyOiAncHJvZ3Jlc3NDdHJsJyxcclxuICAgIHJlcGxhY2U6IHRydWVcclxuICB9O1xyXG59O1xyXG5cclxuZnVuY3Rpb24gc2hlZHVsZVNlYXNvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxyXG4gICAgdGVtcGxhdGVVcmw6IFwiLi4vdGVtcGxhdGVzL3NoZWR1bGUuaHRtbFwiLFxyXG4gICAgY29udHJvbGxlcjogJ3NoZWR1bGVDdHJsJyxcclxuICAgIHJlcGxhY2U6IHRydWVcclxuICB9O1xyXG59O1xyXG5cclxuZnVuY3Rpb24gY2F0ZWdvcmllc1NlYXNvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxyXG4gICAgdGVtcGxhdGVVcmw6IFwiLi4vdGVtcGxhdGVzL2NhdGVnb3JpZXMuaHRtbFwiLFxyXG4gICAgY29udHJvbGxlcjogJ2NhdGVnb3JpZXNDdHJsJyxcclxuICAgIHJlcGxhY2U6IHRydWVcclxuICB9O1xyXG59O1xyXG5cclxuZnVuY3Rpb24gYmF0aHJvb21zU2Vhc29uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogXCJFXCIsXHJcbiAgICB0ZW1wbGF0ZVVybDogXCIuLi90ZW1wbGF0ZXMvYmF0aHJvb21zLmh0bWxcIixcclxuICAgIGNvbnRyb2xsZXI6ICdiYXRocm9vbXNDdHJsJyxcclxuICAgIHJlcGxhY2U6IHRydWVcclxuICB9O1xyXG59O1xyXG5cclxuZnVuY3Rpb24gcHJpY2VzU2Vhc29uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogXCJFXCIsXHJcbiAgICB0ZW1wbGF0ZVVybDogXCIuLi90ZW1wbGF0ZXMvcHJpY2VzLmh0bWxcIixcclxuICAgIGNvbnRyb2xsZXI6ICdwcmljZXNDdHJsJyxcclxuICAgIHJlcGxhY2U6IHRydWVcclxuICB9O1xyXG59O1xyXG5cclxuZnVuY3Rpb24gZnVsbFByaWNlU2Vhc29uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogXCJFXCIsXHJcbiAgICB0ZW1wbGF0ZVVybDogXCIuLi90ZW1wbGF0ZXMvZnVsbC1wcmljZS5odG1sXCIsXHJcbiAgICBjb250cm9sbGVyOiAnZnVsbFByaWNlQ3RybCcsXHJcbiAgICByZXBsYWNlOiB0cnVlXHJcbiAgfTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGNoZWNrYm94RGF5TGFiZWwoKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiBcIkFFXCIsXHJcbiAgICBzY29wZToge1xyXG4gICAgICBpdGVtOiAnPScsXHJcbiAgICAgIGRlZmF1bHREYXlzOiAnPSdcclxuICAgIH0sXHJcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIpIHtcclxuICAgICAgdmFyIGl0ZW0gPSBzY29wZS5pdGVtO1xyXG4gICAgICB2YXIgZGF5cyA9IHNjb3BlLmRlZmF1bHREYXlzO1xyXG4gICAgICB2YXIgaW5kZXggPSBkYXlzWydlbiddLmluZGV4T2YoaXRlbSk7XHJcbiAgICAgIGVsZW0uaHRtbChkYXlzWydydSddW2luZGV4XSk7XHJcbiAgICAgIGRheXNbJ3NlbGVjdGVkJ10ucHVzaChkYXlzLmVuW2luZGV4XSk7XHJcbiAgICAgIGRheXNbJ3Vuc2VsZWN0ZWQnXS5zcGxpY2UoZGF5c1sndW5zZWxlY3RlZCddLmluZGV4T2YoaXRlbSksIDEpO1xyXG4gICAgfVxyXG4gIH07XHJcbn07XHJcblxyXG5mdW5jdGlvbiBjaGVja2JveERheUlucHV0KCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogXCJBRVwiLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgaXRlbTogJz0nLFxyXG4gICAgICBkZWZhdWx0RGF5czogJz0nXHJcbiAgICB9LFxyXG4gICAgbGluazoge1xyXG4gICAgcHJlOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIsIGN0cmwpIHtcclxuICAgIH0sXHJcbiAgICBwb3N0OiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIpe1xyXG4gICAgICB2YXIgaXRlbSA9IHNjb3BlLml0ZW07XHJcbiAgICAgIHZhciBkYXlzID0gc2NvcGUuZGVmYXVsdERheXM7XHJcbi8vIGNyZWF0ZSBlbXB0eSBjaGVja2JveFxyXG4gICAgICAgIGVsZW0ub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBpbmRleCA9IGRheXNbJ3NlbGVjdGVkJ10uaW5kZXhPZihpdGVtKTtcclxuICAgICAgICBpZihlbGVtWzBdLmNoZWNrZWQpe1xyXG4gICAgICAgICAgZGF5c1snc2VsZWN0ZWQnXS5wdXNoKHNjb3BlLml0ZW0pO1xyXG4gICAgICAgICAgZGF5c1sndW5zZWxlY3RlZCddLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICBkYXlzWydzZWxlY3RlZCddLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICBkYXlzWyd1bnNlbGVjdGVkJ10ucHVzaChzY29wZS5pdGVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUuZGVmYXVsdERheXMuc2VsZWN0ZWQuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhIC0gYjtcclxuICAgICAgICB9KSk7XHJcbiAgICAgIH0pO1xyXG4vLyBjcmVhdGUgZW1wdHkgY2hlY2tib3hcclxuICAgIH1cclxuXHJcbiAgICB9XHJcbiAgfTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGFkZE5ld1NoZWR1bGUoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6IFwiQUVcIixcclxuICAgIGNvbnRyb2xsZXI6ICdzaGVkdWxlQ3RybCcsXHJcbiAgICBzY29wZToge1xyXG4gICAgICBkZWZhdWx0RGF5czogJz0nXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICcuLi90ZW1wbGF0ZXMvc2hlZHVsZS1yb3cuaHRtbCcsXHJcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIpIHtcclxuICAgICAgZWxlbS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gaWYoZGF5cy5sZW5ndGggPT09IDApeyByZXR1cm4gfVxyXG4gICAgICAgIHZhciB0ZW1wID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZW1wdHlDaGVja2JveFJvd1wiKSk7XHJcbiAgICAgICAgdmFyIHRlbXBDbG9uZSA9IHRlbXAuY2xvbmUoKTtcclxuICAgICAgICB2YXIgb2xkZWxlbSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNoZWR1bGVzLWNoaWxkXCIpKTtcclxuICAgICAgICBvbGRlbGVtLnBhcmVudCgpLmFwcGVuZCh0ZW1wQ2xvbmUpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59O1xyXG5cclxuXHJcbmZ1bmN0aW9uIGRhdGVwaWNrZXIoKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICByZXF1aXJlOiAnbmdNb2RlbCcsXHJcbiAgICBzY29wZToge1xyXG4gICAgICBkYXRlOiAnPScsXHJcbiAgICAgIHZhbHVlOiAnPXZhbERhdGUnLFxyXG4gICAgICBtb2RlbDogJz1uZ01vZGVsJ1xyXG4gICAgfSxcclxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0ciwgbmdNb2RlbCkge1xyXG4gICAgICAgICBlbGVtLm9uKCdrZXl1cCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhuZ01vZGVsLiR2aWV3VmFsdWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbn07XHJcblxyXG5mdW5jdGlvbiB0aW1lcGlja2VyKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgcmVxdWlyZTogJ25nTW9kZWwnLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgdGltZTogJz0nLFxyXG4gICAgICBtb2RlbDogJz1uZ01vZGVsJ1xyXG4gICAgfSxcclxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0ciwgbmdNb2RlbCkge1xyXG4gICAgICAgIHZhciBkYXRhID0gbmV3IERhdGUobmV3IERhdGUoc2NvcGUudGltZSoxMDAwKS5nZXRUaW1lKCkpO1xyXG4gICAgICAgIHZhciB0aW1lID0gbW9tZW50KGRhdGEudG9TdHJpbmcoKSkuZm9ybWF0KCdISDpNTScpO1xyXG4gICAgICAgIG5nTW9kZWwuJHNldFZpZXdWYWx1ZSh0aW1lKTtcclxuICAgICAgICBuZ01vZGVsLiRyZW5kZXIoKTtcclxuXHJcbiAgICAgICAgIGVsZW0ub24oJ2tleXVwJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufTtcclxuXHJcbnNlYXNvbi5mYWN0b3J5KCdzaGVkdWxlUm93RW1wdHknLCBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGFkZENoZWNrYm94OiBmdW5jdGlvbiAodW5jaGVja2VkKSB7XHJcbiAgICAgIHZhciBkYXlSdSA9IHsgXCJtb25cIjogXCLQn9C9XCIsIFwidHVlXCI6IFwi0JLRglwiLCBcIndlZFwiOiBcItCh0YBcIiwgXCJ0aHVcIjogXCLQp9GCXCIsIFwiZnJpXCI6IFwi0J/RglwiLCBcInNhdFwiOiBcItCh0LFcIiwgXCJzdW5cIjogXCLQktGBXCIgfTtcclxuICAgICAgdmFyIHNwYW4gPSBhbmd1bGFyLmVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgZm9yKGxldCBqPTA7ajx1bmNoZWNrZWQubGVuZ3RoOyBqKyspe1xyXG4gICAgICAgIC8vIGZvciBpbnB1dFxyXG4gICAgICAgIHZhciBpbnB1dCA9IGFuZ3VsYXIuZWxlbWVudCgnPGlucHV0IC8+Jyk7IGNvbnNvbGUubG9nKGlucHV0KTtcclxuICAgICAgICB2YXIgaW5wdXRBdHRyID0gWydmb3JtLWNvbnRyb2wnLCAnY2hlY2tib3gtZGF5LWlucHV0J107XHJcbiAgICAgICAgZm9yKGxldCBpPTA7IGk8aW5wdXRBdHRyLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgIGlucHV0LmFkZENsYXNzKGlucHV0QXR0cltpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGZvciBpbnB1dFxyXG4gICAgICAgIC8vIGZvciBsYWJlbFxyXG4gICAgICAgIHZhciBsYWJlbCA9IGFuZ3VsYXIuZWxlbWVudCgnbGFiZWwnKTsgY29uc29sZS5sb2cobGFiZWwpO1xyXG4gICAgICAgIGxhYmVsLnRleHQoZGF5UnVbdW5jaGVja2VkW2pdXSk7XHJcbiAgICAgICAgLy8gZm9yIGxhYmVsXHJcbiAgICAgICAgc3Bhbi5hcHBlbmQobGFiZWwpO1xyXG4gICAgICAgIHNwYW4uYXBwZW5kKGlucHV0KTtcclxuICAgICAgfVxyXG4gICAgICAvLyB2YXIgdGFyZ2V0RWwgPSBmaW5kKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jaGVja2JveCcpKTtcclxuICAgICAgY29uc29sZS5sb2codGFyZ2V0RWwpO1xyXG4gICAgICAvLyB0YXJnZXRFbC5hcHBlbmQoc3Bhbik7XHJcblxyXG4gICAgfVxyXG4gIH07XHJcbn0pOyJdLCJmaWxlIjoibWFpbi5qcyJ9
