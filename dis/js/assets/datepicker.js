;(function($){
  $.fn.datepicker.dates['ru'] = {
    days: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
    daysShort: ["Вск", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Суб"],
    daysMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
    today: "Сегодня",
    clear: "Очистить",
    format: "dd-mm-yyyy",
    weekStart: 1,
    monthsTitle: 'Месяцы'
  };
}(jQuery));
(function($, window, document) {
  'use strict';

  // TIMEPICKER PUBLIC CLASS DEFINITION
  var Timepicker = function(element, options) {
    this.widget = '';
    this.$element = $(element);
    this.defaultTime = options.defaultTime;
    this.disableFocus = options.disableFocus;
    this.disableMousewheel = options.disableMousewheel;
    this.isOpen = options.isOpen;
    this.minuteStep = options.minuteStep;
    this.modalBackdrop = options.modalBackdrop;
    this.orientation = options.orientation;
    this.secondStep = options.secondStep;
    this.snapToStep = options.snapToStep;
    this.showInputs = options.showInputs;
    this.showMeridian = options.showMeridian;
    this.showSeconds = options.showSeconds;
    this.template = options.template;
    this.appendWidgetTo = options.appendWidgetTo;
    this.showWidgetOnAddonClick = options.showWidgetOnAddonClick;
    this.icons = options.icons;
    this.maxHours = options.maxHours;
    this.explicitMode = options.explicitMode; // If true 123 = 1:23, 12345 = 1:23:45, else invalid.

    this.handleDocumentClick = function (e) {
      var self = e.data.scope;
      // This condition was inspired by bootstrap-datepicker.
      // The element the timepicker is invoked on is the input but it has a sibling for addon/button.
      if (!(self.$element.parent().find(e.target).length ||
          self.$widget.is(e.target) ||
          self.$widget.find(e.target).length)) {
        self.hideWidget();
      }
    };

    this._init();
  };

  Timepicker.prototype = {

    constructor: Timepicker,
    _init: function() {
      var self = this;

      if (this.showWidgetOnAddonClick && (this.$element.parent().hasClass('input-group') && this.$element.parent().hasClass('bootstrap-timepicker'))) {
        this.$element.parent('.input-group.bootstrap-timepicker').find('.input-group-addon').on({
          'click.timepicker': $.proxy(this.showWidget, this)
        });
        this.$element.on({
          'focus.timepicker': $.proxy(this.highlightUnit, this),
          'click.timepicker': $.proxy(this.highlightUnit, this),
          'keydown.timepicker': $.proxy(this.elementKeydown, this),
          'blur.timepicker': $.proxy(this.blurElement, this),
          'mousewheel.timepicker DOMMouseScroll.timepicker': $.proxy(this.mousewheel, this)
        });
      } else {
        if (this.template) {
          this.$element.on({
            'focus.timepicker': $.proxy(this.showWidget, this),
            'click.timepicker': $.proxy(this.showWidget, this),
            'blur.timepicker': $.proxy(this.blurElement, this),
            'mousewheel.timepicker DOMMouseScroll.timepicker': $.proxy(this.mousewheel, this)
          });
        } else {
          this.$element.on({
            'focus.timepicker': $.proxy(this.highlightUnit, this),
            'click.timepicker': $.proxy(this.highlightUnit, this),
            'keydown.timepicker': $.proxy(this.elementKeydown, this),
            'blur.timepicker': $.proxy(this.blurElement, this),
            'mousewheel.timepicker DOMMouseScroll.timepicker': $.proxy(this.mousewheel, this)
          });
        }
      }

      if (this.template !== false) {
        this.$widget = $(this.getTemplate()).on('click', $.proxy(this.widgetClick, this));
      } else {
        this.$widget = false;
      }

      if (this.showInputs && this.$widget !== false) {
        this.$widget.find('input').each(function() {
          $(this).on({
            'click.timepicker': function() { $(this).select(); },
            'keydown.timepicker': $.proxy(self.widgetKeydown, self),
            'keyup.timepicker': $.proxy(self.widgetKeyup, self)
          });
        });
      }

      this.setDefaultTime(this.defaultTime);
    },

    blurElement: function() {
      this.highlightedUnit = null;
      this.updateFromElementVal();
    },

    clear: function() {
      this.hour = '';
      this.minute = '';
      this.second = '';
      this.meridian = '';

      this.$element.val('');
    },

    decrementHour: function() {
      if (this.showMeridian) {
        if (this.hour === 1) {
          this.hour = 12;
        } else if (this.hour === 12) {
          this.hour--;

          return this.toggleMeridian();
        } else if (this.hour === 0) {
          this.hour = 11;

          return this.toggleMeridian();
        } else {
          this.hour--;
        }
      } else {
        if (this.hour <= 0) {
          this.hour = this.maxHours - 1;
        } else {
          this.hour--;
        }
      }
    },

    decrementMinute: function(step) {
      var newVal;

      if (step) {
        newVal = this.minute - step;
      } else {
        newVal = this.minute - this.minuteStep;
      }

      if (newVal < 0) {
        this.decrementHour();
        this.minute = newVal + 60;
      } else {
        this.minute = newVal;
      }
    },

    decrementSecond: function() {
      var newVal = this.second - this.secondStep;

      if (newVal < 0) {
        this.decrementMinute(true);
        this.second = newVal + 60;
      } else {
        this.second = newVal;
      }
    },

    elementKeydown: function(e) {
      switch (e.which) {
      case 9: //tab
        if (e.shiftKey) {
          if (this.highlightedUnit === 'hour') {
            this.hideWidget();
            break;
          }
          this.highlightPrevUnit();
        } else if ((this.showMeridian && this.highlightedUnit === 'meridian') || (this.showSeconds && this.highlightedUnit === 'second') || (!this.showMeridian && !this.showSeconds && this.highlightedUnit ==='minute')) {
          this.hideWidget();
          break;
        } else {
          this.highlightNextUnit();
        }
        e.preventDefault();
        this.updateFromElementVal();
        break;
      case 27: // escape
        this.updateFromElementVal();
        break;
      case 37: // left arrow
        e.preventDefault();
        this.highlightPrevUnit();
        this.updateFromElementVal();
        break;
      case 38: // up arrow
        e.preventDefault();
        switch (this.highlightedUnit) {
        case 'hour':
          this.incrementHour();
          this.highlightHour();
          break;
        case 'minute':
          this.incrementMinute();
          this.highlightMinute();
          break;
        case 'second':
          this.incrementSecond();
          this.highlightSecond();
          break;
        case 'meridian':
          this.toggleMeridian();
          this.highlightMeridian();
          break;
        }
        this.update();
        break;
      case 39: // right arrow
        e.preventDefault();
        this.highlightNextUnit();
        this.updateFromElementVal();
        break;
      case 40: // down arrow
        e.preventDefault();
        switch (this.highlightedUnit) {
        case 'hour':
          this.decrementHour();
          this.highlightHour();
          break;
        case 'minute':
          this.decrementMinute();
          this.highlightMinute();
          break;
        case 'second':
          this.decrementSecond();
          this.highlightSecond();
          break;
        case 'meridian':
          this.toggleMeridian();
          this.highlightMeridian();
          break;
        }

        this.update();
        break;
      }
    },

    getCursorPosition: function() {
      var input = this.$element.get(0);

      if ('selectionStart' in input) {// Standard-compliant browsers

        return input.selectionStart;
      } else if (document.selection) {// IE fix
        input.focus();
        var sel = document.selection.createRange(),
          selLen = document.selection.createRange().text.length;

        sel.moveStart('character', - input.value.length);

        return sel.text.length - selLen;
      }
    },

    getTemplate: function() {
      var template,
        hourTemplate,
        minuteTemplate,
        secondTemplate,
        meridianTemplate,
        templateContent;

      if (this.showInputs) {
        hourTemplate = '<input type="text" class="bootstrap-timepicker-hour" maxlength="2"/>';
        minuteTemplate = '<input type="text" class="bootstrap-timepicker-minute" maxlength="2"/>';
        secondTemplate = '<input type="text" class="bootstrap-timepicker-second" maxlength="2"/>';
        meridianTemplate = '<input type="text" class="bootstrap-timepicker-meridian" maxlength="2"/>';
      } else {
        hourTemplate = '<span class="bootstrap-timepicker-hour"></span>';
        minuteTemplate = '<span class="bootstrap-timepicker-minute"></span>';
        secondTemplate = '<span class="bootstrap-timepicker-second"></span>';
        meridianTemplate = '<span class="bootstrap-timepicker-meridian"></span>';
      }

      templateContent = '<table>'+
         '<tr>'+
           '<td><a href="#" data-action="incrementHour"><span class="'+ this.icons.up +'"></span></a></td>'+
           '<td class="separator">&nbsp;</td>'+
           '<td><a href="#" data-action="incrementMinute"><span class="'+ this.icons.up +'"></span></a></td>'+
           (this.showSeconds ?
             '<td class="separator">&nbsp;</td>'+
             '<td><a href="#" data-action="incrementSecond"><span class="'+ this.icons.up +'"></span></a></td>'
           : '') +
           (this.showMeridian ?
             '<td class="separator">&nbsp;</td>'+
             '<td class="meridian-column"><a href="#" data-action="toggleMeridian"><span class="'+ this.icons.up +'"></span></a></td>'
           : '') +
         '</tr>'+
         '<tr>'+
           '<td>'+ hourTemplate +'</td> '+
           '<td class="separator">:</td>'+
           '<td>'+ minuteTemplate +'</td> '+
           (this.showSeconds ?
            '<td class="separator">:</td>'+
            '<td>'+ secondTemplate +'</td>'
           : '') +
           (this.showMeridian ?
            '<td class="separator">&nbsp;</td>'+
            '<td>'+ meridianTemplate +'</td>'
           : '') +
         '</tr>'+
         '<tr>'+
           '<td><a href="#" data-action="decrementHour"><span class="'+ this.icons.down +'"></span></a></td>'+
           '<td class="separator"></td>'+
           '<td><a href="#" data-action="decrementMinute"><span class="'+ this.icons.down +'"></span></a></td>'+
           (this.showSeconds ?
            '<td class="separator">&nbsp;</td>'+
            '<td><a href="#" data-action="decrementSecond"><span class="'+ this.icons.down +'"></span></a></td>'
           : '') +
           (this.showMeridian ?
            '<td class="separator">&nbsp;</td>'+
            '<td><a href="#" data-action="toggleMeridian"><span class="'+ this.icons.down +'"></span></a></td>'
           : '') +
         '</tr>'+
       '</table>';

      switch(this.template) {
      case 'modal':
        template = '<div class="bootstrap-timepicker-widget modal hide fade in" data-backdrop="'+ (this.modalBackdrop ? 'true' : 'false') +'">'+
          '<div class="modal-header">'+
            '<a href="#" class="close" data-dismiss="modal">&times;</a>'+
            '<h3>Pick a Time</h3>'+
          '</div>'+
          '<div class="modal-content">'+
            templateContent +
          '</div>'+
          '<div class="modal-footer">'+
            '<a href="#" class="btn btn-primary" data-dismiss="modal">OK</a>'+
          '</div>'+
        '</div>';
        break;
      case 'dropdown':
        template = '<div class="bootstrap-timepicker-widget dropdown-menu">'+ templateContent +'</div>';
        break;
      }

      return template;
    },

    getTime: function() {
      if (this.hour === '') {
        return '';
      }

      return this.hour + ':' + (this.minute.toString().length === 1 ? '0' + this.minute : this.minute) + (this.showSeconds ? ':' + (this.second.toString().length === 1 ? '0' + this.second : this.second) : '') + (this.showMeridian ? ' ' + this.meridian : '');
    },

    hideWidget: function() {
      if (this.isOpen === false) {
        return;
      }

      this.$element.trigger({
        'type': 'hide.timepicker',
        'time': {
          'value': this.getTime(),
          'hours': this.hour,
          'minutes': this.minute,
          'seconds': this.second,
          'meridian': this.meridian
        }
      });

      if (this.template === 'modal' && this.$widget.modal) {
        this.$widget.modal('hide');
      } else {
        this.$widget.removeClass('open');
      }

      $(document).off('mousedown.timepicker, touchend.timepicker', this.handleDocumentClick);

      this.isOpen = false;
      // show/hide approach taken by datepicker
      this.$widget.detach();
    },

    highlightUnit: function() {
      this.position = this.getCursorPosition();
      if (this.position >= 0 && this.position <= 2) {
        this.highlightHour();
      } else if (this.position >= 3 && this.position <= 5) {
        this.highlightMinute();
      } else if (this.position >= 6 && this.position <= 8) {
        if (this.showSeconds) {
          this.highlightSecond();
        } else {
          this.highlightMeridian();
        }
      } else if (this.position >= 9 && this.position <= 11) {
        this.highlightMeridian();
      }
    },

    highlightNextUnit: function() {
      switch (this.highlightedUnit) {
      case 'hour':
        this.highlightMinute();
        break;
      case 'minute':
        if (this.showSeconds) {
          this.highlightSecond();
        } else if (this.showMeridian){
          this.highlightMeridian();
        } else {
          this.highlightHour();
        }
        break;
      case 'second':
        if (this.showMeridian) {
          this.highlightMeridian();
        } else {
          this.highlightHour();
        }
        break;
      case 'meridian':
        this.highlightHour();
        break;
      }
    },

    highlightPrevUnit: function() {
      switch (this.highlightedUnit) {
      case 'hour':
        if(this.showMeridian){
          this.highlightMeridian();
        } else if (this.showSeconds) {
          this.highlightSecond();
        } else {
          this.highlightMinute();
        }
        break;
      case 'minute':
        this.highlightHour();
        break;
      case 'second':
        this.highlightMinute();
        break;
      case 'meridian':
        if (this.showSeconds) {
          this.highlightSecond();
        } else {
          this.highlightMinute();
        }
        break;
      }
    },

    highlightHour: function() {
      var $element = this.$element.get(0),
          self = this;

      this.highlightedUnit = 'hour';

      if ($element.setSelectionRange) {
        setTimeout(function() {
          if (self.hour < 10) {
            $element.setSelectionRange(0,1);
          } else {
            $element.setSelectionRange(0,2);
          }
        }, 0);
      }
    },

    highlightMinute: function() {
      var $element = this.$element.get(0),
          self = this;

      this.highlightedUnit = 'minute';

      if ($element.setSelectionRange) {
        setTimeout(function() {
          if (self.hour < 10) {
            $element.setSelectionRange(2,4);
          } else {
            $element.setSelectionRange(3,5);
          }
        }, 0);
      }
    },

    highlightSecond: function() {
      var $element = this.$element.get(0),
          self = this;

      this.highlightedUnit = 'second';

      if ($element.setSelectionRange) {
        setTimeout(function() {
          if (self.hour < 10) {
            $element.setSelectionRange(5,7);
          } else {
            $element.setSelectionRange(6,8);
          }
        }, 0);
      }
    },

    highlightMeridian: function() {
      var $element = this.$element.get(0),
          self = this;

      this.highlightedUnit = 'meridian';

      if ($element.setSelectionRange) {
        if (this.showSeconds) {
          setTimeout(function() {
            if (self.hour < 10) {
              $element.setSelectionRange(8,10);
            } else {
              $element.setSelectionRange(9,11);
            }
          }, 0);
        } else {
          setTimeout(function() {
            if (self.hour < 10) {
              $element.setSelectionRange(5,7);
            } else {
              $element.setSelectionRange(6,8);
            }
          }, 0);
        }
      }
    },

    incrementHour: function() {
      if (this.showMeridian) {
        if (this.hour === 11) {
          this.hour++;
          return this.toggleMeridian();
        } else if (this.hour === 12) {
          this.hour = 0;
        }
      }
      if (this.hour === this.maxHours - 1) {
        this.hour = 0;

        return;
      }
      this.hour++;
    },

    incrementMinute: function(step) {
      var newVal;

      if (step) {
        newVal = this.minute + step;
      } else {
        newVal = this.minute + this.minuteStep - (this.minute % this.minuteStep);
      }

      if (newVal > 59) {
        this.incrementHour();
        this.minute = newVal - 60;
      } else {
        this.minute = newVal;
      }
    },

    incrementSecond: function() {
      var newVal = this.second + this.secondStep - (this.second % this.secondStep);

      if (newVal > 59) {
        this.incrementMinute(true);
        this.second = newVal - 60;
      } else {
        this.second = newVal;
      }
    },

    mousewheel: function(e) {
      if (this.disableMousewheel) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail,
          scrollTo = null;

      if (e.type === 'mousewheel') {
        scrollTo = (e.originalEvent.wheelDelta * -1);
      }
      else if (e.type === 'DOMMouseScroll') {
        scrollTo = 40 * e.originalEvent.detail;
      }

      if (scrollTo) {
        e.preventDefault();
        $(this).scrollTop(scrollTo + $(this).scrollTop());
      }

      switch (this.highlightedUnit) {
      case 'minute':
        if (delta > 0) {
          this.incrementMinute();
        } else {
          this.decrementMinute();
        }
        this.highlightMinute();
        break;
      case 'second':
        if (delta > 0) {
          this.incrementSecond();
        } else {
          this.decrementSecond();
        }
        this.highlightSecond();
        break;
      case 'meridian':
        this.toggleMeridian();
        this.highlightMeridian();
        break;
      default:
        if (delta > 0) {
          this.incrementHour();
        } else {
          this.decrementHour();
        }
        this.highlightHour();
        break;
      }

      return false;
    },

    /**
     * Given a segment value like 43, will round and snap the segment
     * to the nearest "step", like 45 if step is 15. Segment will
     * "overflow" to 0 if it's larger than 59 or would otherwise
     * round up to 60.
     */
    changeToNearestStep: function (segment, step) {
      if (segment % step === 0) {
        return segment;
      }
      if (Math.round((segment % step) / step)) {
        return (segment + (step - segment % step)) % 60;
      } else {
        return segment - segment % step;
      }
    },

    // This method was adapted from bootstrap-datepicker.
    place : function() {
      if (this.isInline) {
        return;
      }
      var widgetWidth = this.$widget.outerWidth(), widgetHeight = this.$widget.outerHeight(), visualPadding = 10, windowWidth =
        $(window).width(), windowHeight = $(window).height(), scrollTop = $(window).scrollTop();

      var zIndex = parseInt(this.$element.parents().filter(function() { return $(this).css('z-index') !== 'auto'; }).first().css('z-index'), 10) + 10;
      var offset = this.component ? this.component.parent().offset() : this.$element.offset();
      var height = this.component ? this.component.outerHeight(true) : this.$element.outerHeight(false);
      var width = this.component ? this.component.outerWidth(true) : this.$element.outerWidth(false);
      var left = offset.left, top = offset.top;

      this.$widget.removeClass('timepicker-orient-top timepicker-orient-bottom timepicker-orient-right timepicker-orient-left');

      if (this.orientation.x !== 'auto') {
        this.$widget.addClass('timepicker-orient-' + this.orientation.x);
        if (this.orientation.x === 'right') {
          left -= widgetWidth - width;
        }
      } else{
        // auto x orientation is best-placement: if it crosses a window edge, fudge it sideways
        // Default to left
        this.$widget.addClass('timepicker-orient-left');
        if (offset.left < 0) {
          left -= offset.left - visualPadding;
        } else if (offset.left + widgetWidth > windowWidth) {
          left = windowWidth - widgetWidth - visualPadding;
        }
      }
      // auto y orientation is best-situation: top or bottom, no fudging, decision based on which shows more of the widget
      var yorient = this.orientation.y, topOverflow, bottomOverflow;
      if (yorient === 'auto') {
        topOverflow = -scrollTop + offset.top - widgetHeight;
        bottomOverflow = scrollTop + windowHeight - (offset.top + height + widgetHeight);
        if (Math.max(topOverflow, bottomOverflow) === bottomOverflow) {
          yorient = 'top';
        } else {
          yorient = 'bottom';
        }
      }
      this.$widget.addClass('timepicker-orient-' + yorient);
      if (yorient === 'top'){
        top += height;
      } else{
        top -= widgetHeight + parseInt(this.$widget.css('padding-top'), 10);
      }

      this.$widget.css({
        top : top,
        left : left,
        zIndex : zIndex
      });
    },

    remove: function() {
      $('document').off('.timepicker');
      if (this.$widget) {
        this.$widget.remove();
      }
      delete this.$element.data().timepicker;
    },

    setDefaultTime: function(defaultTime) {
      if (!this.$element.val()) {
        if (defaultTime === 'current') {
          var dTime = new Date(),
            hours = dTime.getHours(),
            minutes = dTime.getMinutes(),
            seconds = dTime.getSeconds(),
            meridian = 'AM';

          if (seconds !== 0) {
            seconds = Math.ceil(dTime.getSeconds() / this.secondStep) * this.secondStep;
            if (seconds === 60) {
              minutes += 1;
              seconds = 0;
            }
          }

          if (minutes !== 0) {
            minutes = Math.ceil(dTime.getMinutes() / this.minuteStep) * this.minuteStep;
            if (minutes === 60) {
              hours += 1;
              minutes = 0;
            }
          }

          if (this.showMeridian) {
            if (hours === 0) {
              hours = 12;
            } else if (hours >= 12) {
              if (hours > 12) {
                hours = hours - 12;
              }
              meridian = 'PM';
            } else {
              meridian = 'AM';
            }
          }

          this.hour = hours;
          this.minute = minutes;
          this.second = seconds;
          this.meridian = meridian;

          this.update();

        } else if (defaultTime === false) {
          this.hour = 0;
          this.minute = 0;
          this.second = 0;
          this.meridian = 'AM';
        } else {
          this.setTime(defaultTime);
        }
      } else {
        this.updateFromElementVal();
      }
    },

    setTime: function(time, ignoreWidget) {
      if (!time) {
        this.clear();
        return;
      }

      var timeMode,
          timeArray,
          hour,
          minute,
          second,
          meridian;

      if (typeof time === 'object' && time.getMonth){
        // this is a date object
        hour    = time.getHours();
        minute  = time.getMinutes();
        second  = time.getSeconds();

        if (this.showMeridian){
          meridian = 'AM';
          if (hour > 12){
            meridian = 'PM';
            hour = hour % 12;
          }

          if (hour === 12){
            meridian = 'PM';
          }
        }
      } else {
        timeMode = ((/a/i).test(time) ? 1 : 0) + ((/p/i).test(time) ? 2 : 0); // 0 = none, 1 = AM, 2 = PM, 3 = BOTH.
        if (timeMode > 2) { // If both are present, fail.
          this.clear();
          return;
        }

        timeArray = time.replace(/[^0-9\:]/g, '').split(':');

        hour = timeArray[0] ? timeArray[0].toString() : timeArray.toString();

        if(this.explicitMode && hour.length > 2 && (hour.length % 2) !== 0 ) {
          this.clear();
          return;
        }

        minute = timeArray[1] ? timeArray[1].toString() : '';
        second = timeArray[2] ? timeArray[2].toString() : '';

        // adaptive time parsing
        if (hour.length > 4) {
          second = hour.slice(-2);
          hour = hour.slice(0, -2);
        }

        if (hour.length > 2) {
          minute = hour.slice(-2);
          hour = hour.slice(0, -2);
        }

        if (minute.length > 2) {
          second = minute.slice(-2);
          minute = minute.slice(0, -2);
        }

        hour = parseInt(hour, 10);
        minute = parseInt(minute, 10);
        second = parseInt(second, 10);

        if (isNaN(hour)) {
          hour = 0;
        }
        if (isNaN(minute)) {
          minute = 0;
        }
        if (isNaN(second)) {
          second = 0;
        }

        // Adjust the time based upon unit boundary.
        // NOTE: Negatives will never occur due to time.replace() above.
        if (second > 59) {
          second = 59;
        }

        if (minute > 59) {
          minute = 59;
        }

        if (hour >= this.maxHours) {
          // No day/date handling.
          hour = this.maxHours - 1;
        }

        if (this.showMeridian) {
          if (hour > 12) {
            // Force PM.
            timeMode = 2;
            hour -= 12;
          }
          if (!timeMode) {
            timeMode = 1;
          }
          if (hour === 0) {
            hour = 12; // AM or PM, reset to 12.  0 AM = 12 AM.  0 PM = 12 PM, etc.
          }
          meridian = timeMode === 1 ? 'AM' : 'PM';
        } else if (hour < 12 && timeMode === 2) {
          hour += 12;
        } else {
          if (hour >= this.maxHours) {
            hour = this.maxHours - 1;
          } else if ((hour < 0) || (hour === 12 && timeMode === 1)){
            hour = 0;
          }
        }
      }

      this.hour = hour;
      if (this.snapToStep) {
        this.minute = this.changeToNearestStep(minute, this.minuteStep);
        this.second = this.changeToNearestStep(second, this.secondStep);
      } else {
        this.minute = minute;
        this.second = second;
      }
      this.meridian = meridian;

      this.update(ignoreWidget);
    },

    showWidget: function() {
      if (this.isOpen) {
        return;
      }

      if (this.$element.is(':disabled')) {
        return;
      }

      // show/hide approach taken by datepicker
      this.$widget.appendTo(this.appendWidgetTo);
      $(document).on('mousedown.timepicker, touchend.timepicker', {scope: this}, this.handleDocumentClick);

      this.$element.trigger({
        'type': 'show.timepicker',
        'time': {
          'value': this.getTime(),
          'hours': this.hour,
          'minutes': this.minute,
          'seconds': this.second,
          'meridian': this.meridian
        }
      });

      this.place();
      if (this.disableFocus) {
        this.$element.blur();
      }

      // widget shouldn't be empty on open
      if (this.hour === '') {
        if (this.defaultTime) {
          this.setDefaultTime(this.defaultTime);
        } else {
          this.setTime('0:0:0');
        }
      }

      if (this.template === 'modal' && this.$widget.modal) {
        this.$widget.modal('show').on('hidden', $.proxy(this.hideWidget, this));
      } else {
        if (this.isOpen === false) {
          this.$widget.addClass('open');
        }
      }

      this.isOpen = true;
    },

    toggleMeridian: function() {
      this.meridian = this.meridian === 'AM' ? 'PM' : 'AM';
    },

    update: function(ignoreWidget) {
      this.updateElement();
      if (!ignoreWidget) {
        this.updateWidget();
      }

      this.$element.trigger({
        'type': 'changeTime.timepicker',
        'time': {
          'value': this.getTime(),
          'hours': this.hour,
          'minutes': this.minute,
          'seconds': this.second,
          'meridian': this.meridian
        }
      });
    },

    updateElement: function() {
      this.$element.val(this.getTime()).change();
    },

    updateFromElementVal: function() {
      this.setTime(this.$element.val());
    },

    updateWidget: function() {
      if (this.$widget === false) {
        return;
      }

      var hour = this.hour,
          minute = this.minute.toString().length === 1 ? '0' + this.minute : this.minute,
          second = this.second.toString().length === 1 ? '0' + this.second : this.second;

      if (this.showInputs) {
        this.$widget.find('input.bootstrap-timepicker-hour').val(hour);
        this.$widget.find('input.bootstrap-timepicker-minute').val(minute);

        if (this.showSeconds) {
          this.$widget.find('input.bootstrap-timepicker-second').val(second);
        }
        if (this.showMeridian) {
          this.$widget.find('input.bootstrap-timepicker-meridian').val(this.meridian);
        }
      } else {
        this.$widget.find('span.bootstrap-timepicker-hour').text(hour);
        this.$widget.find('span.bootstrap-timepicker-minute').text(minute);

        if (this.showSeconds) {
          this.$widget.find('span.bootstrap-timepicker-second').text(second);
        }
        if (this.showMeridian) {
          this.$widget.find('span.bootstrap-timepicker-meridian').text(this.meridian);
        }
      }
    },

    updateFromWidgetInputs: function() {
      if (this.$widget === false) {
        return;
      }

      var t = this.$widget.find('input.bootstrap-timepicker-hour').val() + ':' +
              this.$widget.find('input.bootstrap-timepicker-minute').val() +
              (this.showSeconds ? ':' + this.$widget.find('input.bootstrap-timepicker-second').val() : '') +
              (this.showMeridian ? this.$widget.find('input.bootstrap-timepicker-meridian').val() : '')
      ;

      this.setTime(t, true);
    },

    widgetClick: function(e) {
      e.stopPropagation();
      e.preventDefault();

      var $input = $(e.target),
          action = $input.closest('a').data('action');

      if (action) {
        this[action]();
      }
      this.update();

      if ($input.is('input')) {
        $input.get(0).setSelectionRange(0,2);
      }
    },

    widgetKeydown: function(e) {
      var $input = $(e.target),
          name = $input.attr('class').replace('bootstrap-timepicker-', '');

      switch (e.which) {
      case 9: //tab
        if (e.shiftKey) {
          if (name === 'hour') {
            return this.hideWidget();
          }
        } else if ((this.showMeridian && name === 'meridian') || (this.showSeconds && name === 'second') || (!this.showMeridian && !this.showSeconds && name === 'minute')) {
          return this.hideWidget();
        }
        break;
      case 27: // escape
        this.hideWidget();
        break;
      case 38: // up arrow
        e.preventDefault();
        switch (name) {
        case 'hour':
          this.incrementHour();
          break;
        case 'minute':
          this.incrementMinute();
          break;
        case 'second':
          this.incrementSecond();
          break;
        case 'meridian':
          this.toggleMeridian();
          break;
        }
        this.setTime(this.getTime());
        $input.get(0).setSelectionRange(0,2);
        break;
      case 40: // down arrow
        e.preventDefault();
        switch (name) {
        case 'hour':
          this.decrementHour();
          break;
        case 'minute':
          this.decrementMinute();
          break;
        case 'second':
          this.decrementSecond();
          break;
        case 'meridian':
          this.toggleMeridian();
          break;
        }
        this.setTime(this.getTime());
        $input.get(0).setSelectionRange(0,2);
        break;
      }
    },

    widgetKeyup: function(e) {
      if ((e.which === 65) || (e.which === 77) || (e.which === 80) || (e.which === 46) || (e.which === 8) || (e.which >= 48 && e.which <= 57) || (e.which >= 96 && e.which <= 105)) {
        this.updateFromWidgetInputs();
      }
    }
  };

  //TIMEPICKER PLUGIN DEFINITION
  $.fn.timepicker = function(option) {
    var args = Array.apply(null, arguments);
    args.shift();
    return this.each(function() {
      var $this = $(this),
        data = $this.data('timepicker'),
        options = typeof option === 'object' && option;

      if (!data) {
        $this.data('timepicker', (data = new Timepicker(this, $.extend({}, $.fn.timepicker.defaults, options, $(this).data()))));
      }

      if (typeof option === 'string') {
        data[option].apply(data, args);
      }
    });
  };

  $.fn.timepicker.defaults = {
    defaultTime: 'current',
    disableFocus: false,
    disableMousewheel: false,
    isOpen: false,
    minuteStep: 15,
    modalBackdrop: false,
    orientation: { x: 'auto', y: 'auto'},
    secondStep: 15,
    snapToStep: false,
    showSeconds: false,
    showInputs: true,
    showMeridian: true,
    template: 'dropdown',
    appendWidgetTo: 'body',
    showWidgetOnAddonClick: true,
    icons: {
      up: 'glyphicon glyphicon-chevron-up',
      down: 'glyphicon glyphicon-chevron-down'
    },
    maxHours: 24,
    explicitMode: false
  };

  $.fn.timepicker.Constructor = Timepicker;

  $(document).on(
    'focus.timepicker.data-api click.timepicker.data-api',
    '[data-provide="timepicker"]',
    function(e){
      var $this = $(this);
      if ($this.data('timepicker')) {
        return;
      }
      e.preventDefault();
      // component click requires us to explicitly show it
      $this.timepicker();
    }
  );

})(jQuery, window, document);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhc3NldHMvZGF0ZXBpY2tlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyI7KGZ1bmN0aW9uKCQpe1xyXG4gICQuZm4uZGF0ZXBpY2tlci5kYXRlc1sncnUnXSA9IHtcclxuICAgIGRheXM6IFtcItCS0L7RgdC60YDQtdGB0LXQvdGM0LVcIiwgXCLQn9C+0L3QtdC00LXQu9GM0L3QuNC6XCIsIFwi0JLRgtC+0YDQvdC40LpcIiwgXCLQodGA0LXQtNCwXCIsIFwi0KfQtdGC0LLQtdGA0LNcIiwgXCLQn9GP0YLQvdC40YbQsFwiLCBcItCh0YPQsdCx0L7RgtCwXCJdLFxyXG4gICAgZGF5c1Nob3J0OiBbXCLQktGB0LpcIiwgXCLQn9C90LRcIiwgXCLQktGC0YBcIiwgXCLQodGA0LRcIiwgXCLQp9GC0LJcIiwgXCLQn9GC0L1cIiwgXCLQodGD0LFcIl0sXHJcbiAgICBkYXlzTWluOiBbXCLQktGBXCIsIFwi0J/QvVwiLCBcItCS0YJcIiwgXCLQodGAXCIsIFwi0KfRglwiLCBcItCf0YJcIiwgXCLQodCxXCJdLFxyXG4gICAgbW9udGhzOiBbXCLQr9C90LLQsNGA0YxcIiwgXCLQpNC10LLRgNCw0LvRjFwiLCBcItCc0LDRgNGCXCIsIFwi0JDQv9GA0LXQu9GMXCIsIFwi0JzQsNC5XCIsIFwi0JjRjtC90YxcIiwgXCLQmNGO0LvRjFwiLCBcItCQ0LLQs9GD0YHRglwiLCBcItCh0LXQvdGC0Y/QsdGA0YxcIiwgXCLQntC60YLRj9Cx0YDRjFwiLCBcItCd0L7Rj9Cx0YDRjFwiLCBcItCU0LXQutCw0LHRgNGMXCJdLFxyXG4gICAgbW9udGhzU2hvcnQ6IFtcItCv0L3QslwiLCBcItCk0LXQslwiLCBcItCc0LDRgFwiLCBcItCQ0L/RgFwiLCBcItCc0LDQuVwiLCBcItCY0Y7QvVwiLCBcItCY0Y7Qu1wiLCBcItCQ0LLQs1wiLCBcItCh0LXQvVwiLCBcItCe0LrRglwiLCBcItCd0L7Rj1wiLCBcItCU0LXQulwiXSxcclxuICAgIHRvZGF5OiBcItCh0LXQs9C+0LTQvdGPXCIsXHJcbiAgICBjbGVhcjogXCLQntGH0LjRgdGC0LjRgtGMXCIsXHJcbiAgICBmb3JtYXQ6IFwiZGQtbW0teXl5eVwiLFxyXG4gICAgd2Vla1N0YXJ0OiAxLFxyXG4gICAgbW9udGhzVGl0bGU6ICfQnNC10YHRj9GG0YsnXHJcbiAgfTtcclxufShqUXVlcnkpKTtcclxuKGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIFRJTUVQSUNLRVIgUFVCTElDIENMQVNTIERFRklOSVRJT05cclxuICB2YXIgVGltZXBpY2tlciA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMud2lkZ2V0ID0gJyc7XHJcbiAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KTtcclxuICAgIHRoaXMuZGVmYXVsdFRpbWUgPSBvcHRpb25zLmRlZmF1bHRUaW1lO1xyXG4gICAgdGhpcy5kaXNhYmxlRm9jdXMgPSBvcHRpb25zLmRpc2FibGVGb2N1cztcclxuICAgIHRoaXMuZGlzYWJsZU1vdXNld2hlZWwgPSBvcHRpb25zLmRpc2FibGVNb3VzZXdoZWVsO1xyXG4gICAgdGhpcy5pc09wZW4gPSBvcHRpb25zLmlzT3BlbjtcclxuICAgIHRoaXMubWludXRlU3RlcCA9IG9wdGlvbnMubWludXRlU3RlcDtcclxuICAgIHRoaXMubW9kYWxCYWNrZHJvcCA9IG9wdGlvbnMubW9kYWxCYWNrZHJvcDtcclxuICAgIHRoaXMub3JpZW50YXRpb24gPSBvcHRpb25zLm9yaWVudGF0aW9uO1xyXG4gICAgdGhpcy5zZWNvbmRTdGVwID0gb3B0aW9ucy5zZWNvbmRTdGVwO1xyXG4gICAgdGhpcy5zbmFwVG9TdGVwID0gb3B0aW9ucy5zbmFwVG9TdGVwO1xyXG4gICAgdGhpcy5zaG93SW5wdXRzID0gb3B0aW9ucy5zaG93SW5wdXRzO1xyXG4gICAgdGhpcy5zaG93TWVyaWRpYW4gPSBvcHRpb25zLnNob3dNZXJpZGlhbjtcclxuICAgIHRoaXMuc2hvd1NlY29uZHMgPSBvcHRpb25zLnNob3dTZWNvbmRzO1xyXG4gICAgdGhpcy50ZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGU7XHJcbiAgICB0aGlzLmFwcGVuZFdpZGdldFRvID0gb3B0aW9ucy5hcHBlbmRXaWRnZXRUbztcclxuICAgIHRoaXMuc2hvd1dpZGdldE9uQWRkb25DbGljayA9IG9wdGlvbnMuc2hvd1dpZGdldE9uQWRkb25DbGljaztcclxuICAgIHRoaXMuaWNvbnMgPSBvcHRpb25zLmljb25zO1xyXG4gICAgdGhpcy5tYXhIb3VycyA9IG9wdGlvbnMubWF4SG91cnM7XHJcbiAgICB0aGlzLmV4cGxpY2l0TW9kZSA9IG9wdGlvbnMuZXhwbGljaXRNb2RlOyAvLyBJZiB0cnVlIDEyMyA9IDE6MjMsIDEyMzQ1ID0gMToyMzo0NSwgZWxzZSBpbnZhbGlkLlxyXG5cclxuICAgIHRoaXMuaGFuZGxlRG9jdW1lbnRDbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHZhciBzZWxmID0gZS5kYXRhLnNjb3BlO1xyXG4gICAgICAvLyBUaGlzIGNvbmRpdGlvbiB3YXMgaW5zcGlyZWQgYnkgYm9vdHN0cmFwLWRhdGVwaWNrZXIuXHJcbiAgICAgIC8vIFRoZSBlbGVtZW50IHRoZSB0aW1lcGlja2VyIGlzIGludm9rZWQgb24gaXMgdGhlIGlucHV0IGJ1dCBpdCBoYXMgYSBzaWJsaW5nIGZvciBhZGRvbi9idXR0b24uXHJcbiAgICAgIGlmICghKHNlbGYuJGVsZW1lbnQucGFyZW50KCkuZmluZChlLnRhcmdldCkubGVuZ3RoIHx8XHJcbiAgICAgICAgICBzZWxmLiR3aWRnZXQuaXMoZS50YXJnZXQpIHx8XHJcbiAgICAgICAgICBzZWxmLiR3aWRnZXQuZmluZChlLnRhcmdldCkubGVuZ3RoKSkge1xyXG4gICAgICAgIHNlbGYuaGlkZVdpZGdldCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX2luaXQoKTtcclxuICB9O1xyXG5cclxuICBUaW1lcGlja2VyLnByb3RvdHlwZSA9IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogVGltZXBpY2tlcixcclxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgaWYgKHRoaXMuc2hvd1dpZGdldE9uQWRkb25DbGljayAmJiAodGhpcy4kZWxlbWVudC5wYXJlbnQoKS5oYXNDbGFzcygnaW5wdXQtZ3JvdXAnKSAmJiB0aGlzLiRlbGVtZW50LnBhcmVudCgpLmhhc0NsYXNzKCdib290c3RyYXAtdGltZXBpY2tlcicpKSkge1xyXG4gICAgICAgIHRoaXMuJGVsZW1lbnQucGFyZW50KCcuaW5wdXQtZ3JvdXAuYm9vdHN0cmFwLXRpbWVwaWNrZXInKS5maW5kKCcuaW5wdXQtZ3JvdXAtYWRkb24nKS5vbih7XHJcbiAgICAgICAgICAnY2xpY2sudGltZXBpY2tlcic6ICQucHJveHkodGhpcy5zaG93V2lkZ2V0LCB0aGlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oe1xyXG4gICAgICAgICAgJ2ZvY3VzLnRpbWVwaWNrZXInOiAkLnByb3h5KHRoaXMuaGlnaGxpZ2h0VW5pdCwgdGhpcyksXHJcbiAgICAgICAgICAnY2xpY2sudGltZXBpY2tlcic6ICQucHJveHkodGhpcy5oaWdobGlnaHRVbml0LCB0aGlzKSxcclxuICAgICAgICAgICdrZXlkb3duLnRpbWVwaWNrZXInOiAkLnByb3h5KHRoaXMuZWxlbWVudEtleWRvd24sIHRoaXMpLFxyXG4gICAgICAgICAgJ2JsdXIudGltZXBpY2tlcic6ICQucHJveHkodGhpcy5ibHVyRWxlbWVudCwgdGhpcyksXHJcbiAgICAgICAgICAnbW91c2V3aGVlbC50aW1lcGlja2VyIERPTU1vdXNlU2Nyb2xsLnRpbWVwaWNrZXInOiAkLnByb3h5KHRoaXMubW91c2V3aGVlbCwgdGhpcylcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAodGhpcy50ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5vbih7XHJcbiAgICAgICAgICAgICdmb2N1cy50aW1lcGlja2VyJzogJC5wcm94eSh0aGlzLnNob3dXaWRnZXQsIHRoaXMpLFxyXG4gICAgICAgICAgICAnY2xpY2sudGltZXBpY2tlcic6ICQucHJveHkodGhpcy5zaG93V2lkZ2V0LCB0aGlzKSxcclxuICAgICAgICAgICAgJ2JsdXIudGltZXBpY2tlcic6ICQucHJveHkodGhpcy5ibHVyRWxlbWVudCwgdGhpcyksXHJcbiAgICAgICAgICAgICdtb3VzZXdoZWVsLnRpbWVwaWNrZXIgRE9NTW91c2VTY3JvbGwudGltZXBpY2tlcic6ICQucHJveHkodGhpcy5tb3VzZXdoZWVsLCB0aGlzKVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuJGVsZW1lbnQub24oe1xyXG4gICAgICAgICAgICAnZm9jdXMudGltZXBpY2tlcic6ICQucHJveHkodGhpcy5oaWdobGlnaHRVbml0LCB0aGlzKSxcclxuICAgICAgICAgICAgJ2NsaWNrLnRpbWVwaWNrZXInOiAkLnByb3h5KHRoaXMuaGlnaGxpZ2h0VW5pdCwgdGhpcyksXHJcbiAgICAgICAgICAgICdrZXlkb3duLnRpbWVwaWNrZXInOiAkLnByb3h5KHRoaXMuZWxlbWVudEtleWRvd24sIHRoaXMpLFxyXG4gICAgICAgICAgICAnYmx1ci50aW1lcGlja2VyJzogJC5wcm94eSh0aGlzLmJsdXJFbGVtZW50LCB0aGlzKSxcclxuICAgICAgICAgICAgJ21vdXNld2hlZWwudGltZXBpY2tlciBET01Nb3VzZVNjcm9sbC50aW1lcGlja2VyJzogJC5wcm94eSh0aGlzLm1vdXNld2hlZWwsIHRoaXMpXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0aGlzLnRlbXBsYXRlICE9PSBmYWxzZSkge1xyXG4gICAgICAgIHRoaXMuJHdpZGdldCA9ICQodGhpcy5nZXRUZW1wbGF0ZSgpKS5vbignY2xpY2snLCAkLnByb3h5KHRoaXMud2lkZ2V0Q2xpY2ssIHRoaXMpKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLiR3aWRnZXQgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuc2hvd0lucHV0cyAmJiB0aGlzLiR3aWRnZXQgIT09IGZhbHNlKSB7XHJcbiAgICAgICAgdGhpcy4kd2lkZ2V0LmZpbmQoJ2lucHV0JykuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICQodGhpcykub24oe1xyXG4gICAgICAgICAgICAnY2xpY2sudGltZXBpY2tlcic6IGZ1bmN0aW9uKCkgeyAkKHRoaXMpLnNlbGVjdCgpOyB9LFxyXG4gICAgICAgICAgICAna2V5ZG93bi50aW1lcGlja2VyJzogJC5wcm94eShzZWxmLndpZGdldEtleWRvd24sIHNlbGYpLFxyXG4gICAgICAgICAgICAna2V5dXAudGltZXBpY2tlcic6ICQucHJveHkoc2VsZi53aWRnZXRLZXl1cCwgc2VsZilcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnNldERlZmF1bHRUaW1lKHRoaXMuZGVmYXVsdFRpbWUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBibHVyRWxlbWVudDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuaGlnaGxpZ2h0ZWRVbml0ID0gbnVsbDtcclxuICAgICAgdGhpcy51cGRhdGVGcm9tRWxlbWVudFZhbCgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuaG91ciA9ICcnO1xyXG4gICAgICB0aGlzLm1pbnV0ZSA9ICcnO1xyXG4gICAgICB0aGlzLnNlY29uZCA9ICcnO1xyXG4gICAgICB0aGlzLm1lcmlkaWFuID0gJyc7XHJcblxyXG4gICAgICB0aGlzLiRlbGVtZW50LnZhbCgnJyk7XHJcbiAgICB9LFxyXG5cclxuICAgIGRlY3JlbWVudEhvdXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAodGhpcy5zaG93TWVyaWRpYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5ob3VyID09PSAxKSB7XHJcbiAgICAgICAgICB0aGlzLmhvdXIgPSAxMjtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaG91ciA9PT0gMTIpIHtcclxuICAgICAgICAgIHRoaXMuaG91ci0tO1xyXG5cclxuICAgICAgICAgIHJldHVybiB0aGlzLnRvZ2dsZU1lcmlkaWFuKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhvdXIgPT09IDApIHtcclxuICAgICAgICAgIHRoaXMuaG91ciA9IDExO1xyXG5cclxuICAgICAgICAgIHJldHVybiB0aGlzLnRvZ2dsZU1lcmlkaWFuKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuaG91ci0tO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAodGhpcy5ob3VyIDw9IDApIHtcclxuICAgICAgICAgIHRoaXMuaG91ciA9IHRoaXMubWF4SG91cnMgLSAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmhvdXItLTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZGVjcmVtZW50TWludXRlOiBmdW5jdGlvbihzdGVwKSB7XHJcbiAgICAgIHZhciBuZXdWYWw7XHJcblxyXG4gICAgICBpZiAoc3RlcCkge1xyXG4gICAgICAgIG5ld1ZhbCA9IHRoaXMubWludXRlIC0gc3RlcDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBuZXdWYWwgPSB0aGlzLm1pbnV0ZSAtIHRoaXMubWludXRlU3RlcDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG5ld1ZhbCA8IDApIHtcclxuICAgICAgICB0aGlzLmRlY3JlbWVudEhvdXIoKTtcclxuICAgICAgICB0aGlzLm1pbnV0ZSA9IG5ld1ZhbCArIDYwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubWludXRlID0gbmV3VmFsO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGRlY3JlbWVudFNlY29uZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBuZXdWYWwgPSB0aGlzLnNlY29uZCAtIHRoaXMuc2Vjb25kU3RlcDtcclxuXHJcbiAgICAgIGlmIChuZXdWYWwgPCAwKSB7XHJcbiAgICAgICAgdGhpcy5kZWNyZW1lbnRNaW51dGUodHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5zZWNvbmQgPSBuZXdWYWwgKyA2MDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnNlY29uZCA9IG5ld1ZhbDtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBlbGVtZW50S2V5ZG93bjogZnVuY3Rpb24oZSkge1xyXG4gICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcclxuICAgICAgY2FzZSA5OiAvL3RhYlxyXG4gICAgICAgIGlmIChlLnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5oaWdobGlnaHRlZFVuaXQgPT09ICdob3VyJykge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVXaWRnZXQoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodFByZXZVbml0KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5zaG93TWVyaWRpYW4gJiYgdGhpcy5oaWdobGlnaHRlZFVuaXQgPT09ICdtZXJpZGlhbicpIHx8ICh0aGlzLnNob3dTZWNvbmRzICYmIHRoaXMuaGlnaGxpZ2h0ZWRVbml0ID09PSAnc2Vjb25kJykgfHwgKCF0aGlzLnNob3dNZXJpZGlhbiAmJiAhdGhpcy5zaG93U2Vjb25kcyAmJiB0aGlzLmhpZ2hsaWdodGVkVW5pdCA9PT0nbWludXRlJykpIHtcclxuICAgICAgICAgIHRoaXMuaGlkZVdpZGdldCgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0TmV4dFVuaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlRnJvbUVsZW1lbnRWYWwoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAyNzogLy8gZXNjYXBlXHJcbiAgICAgICAgdGhpcy51cGRhdGVGcm9tRWxlbWVudFZhbCgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDM3OiAvLyBsZWZ0IGFycm93XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0UHJldlVuaXQoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUZyb21FbGVtZW50VmFsKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMzg6IC8vIHVwIGFycm93XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5oaWdobGlnaHRlZFVuaXQpIHtcclxuICAgICAgICBjYXNlICdob3VyJzpcclxuICAgICAgICAgIHRoaXMuaW5jcmVtZW50SG91cigpO1xyXG4gICAgICAgICAgdGhpcy5oaWdobGlnaHRIb3VyKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdtaW51dGUnOlxyXG4gICAgICAgICAgdGhpcy5pbmNyZW1lbnRNaW51dGUoKTtcclxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0TWludXRlKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdzZWNvbmQnOlxyXG4gICAgICAgICAgdGhpcy5pbmNyZW1lbnRTZWNvbmQoKTtcclxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0U2Vjb25kKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdtZXJpZGlhbic6XHJcbiAgICAgICAgICB0aGlzLnRvZ2dsZU1lcmlkaWFuKCk7XHJcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodE1lcmlkaWFuKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAzOTogLy8gcmlnaHQgYXJyb3dcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHROZXh0VW5pdCgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlRnJvbUVsZW1lbnRWYWwoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA0MDogLy8gZG93biBhcnJvd1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuaGlnaGxpZ2h0ZWRVbml0KSB7XHJcbiAgICAgICAgY2FzZSAnaG91cic6XHJcbiAgICAgICAgICB0aGlzLmRlY3JlbWVudEhvdXIoKTtcclxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0SG91cigpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbWludXRlJzpcclxuICAgICAgICAgIHRoaXMuZGVjcmVtZW50TWludXRlKCk7XHJcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodE1pbnV0ZSgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnc2Vjb25kJzpcclxuICAgICAgICAgIHRoaXMuZGVjcmVtZW50U2Vjb25kKCk7XHJcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodFNlY29uZCgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbWVyaWRpYW4nOlxyXG4gICAgICAgICAgdGhpcy50b2dnbGVNZXJpZGlhbigpO1xyXG4gICAgICAgICAgdGhpcy5oaWdobGlnaHRNZXJpZGlhbigpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEN1cnNvclBvc2l0aW9uOiBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGlucHV0ID0gdGhpcy4kZWxlbWVudC5nZXQoMCk7XHJcblxyXG4gICAgICBpZiAoJ3NlbGVjdGlvblN0YXJ0JyBpbiBpbnB1dCkgey8vIFN0YW5kYXJkLWNvbXBsaWFudCBicm93c2Vyc1xyXG5cclxuICAgICAgICByZXR1cm4gaW5wdXQuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7Ly8gSUUgZml4XHJcbiAgICAgICAgaW5wdXQuZm9jdXMoKTtcclxuICAgICAgICB2YXIgc2VsID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCksXHJcbiAgICAgICAgICBzZWxMZW4gPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKS50ZXh0Lmxlbmd0aDtcclxuXHJcbiAgICAgICAgc2VsLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgLSBpbnB1dC52YWx1ZS5sZW5ndGgpO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsLnRleHQubGVuZ3RoIC0gc2VsTGVuO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFRlbXBsYXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIHRlbXBsYXRlLFxyXG4gICAgICAgIGhvdXJUZW1wbGF0ZSxcclxuICAgICAgICBtaW51dGVUZW1wbGF0ZSxcclxuICAgICAgICBzZWNvbmRUZW1wbGF0ZSxcclxuICAgICAgICBtZXJpZGlhblRlbXBsYXRlLFxyXG4gICAgICAgIHRlbXBsYXRlQ29udGVudDtcclxuXHJcbiAgICAgIGlmICh0aGlzLnNob3dJbnB1dHMpIHtcclxuICAgICAgICBob3VyVGVtcGxhdGUgPSAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJib290c3RyYXAtdGltZXBpY2tlci1ob3VyXCIgbWF4bGVuZ3RoPVwiMlwiLz4nO1xyXG4gICAgICAgIG1pbnV0ZVRlbXBsYXRlID0gJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiYm9vdHN0cmFwLXRpbWVwaWNrZXItbWludXRlXCIgbWF4bGVuZ3RoPVwiMlwiLz4nO1xyXG4gICAgICAgIHNlY29uZFRlbXBsYXRlID0gJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiYm9vdHN0cmFwLXRpbWVwaWNrZXItc2Vjb25kXCIgbWF4bGVuZ3RoPVwiMlwiLz4nO1xyXG4gICAgICAgIG1lcmlkaWFuVGVtcGxhdGUgPSAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJib290c3RyYXAtdGltZXBpY2tlci1tZXJpZGlhblwiIG1heGxlbmd0aD1cIjJcIi8+JztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBob3VyVGVtcGxhdGUgPSAnPHNwYW4gY2xhc3M9XCJib290c3RyYXAtdGltZXBpY2tlci1ob3VyXCI+PC9zcGFuPic7XHJcbiAgICAgICAgbWludXRlVGVtcGxhdGUgPSAnPHNwYW4gY2xhc3M9XCJib290c3RyYXAtdGltZXBpY2tlci1taW51dGVcIj48L3NwYW4+JztcclxuICAgICAgICBzZWNvbmRUZW1wbGF0ZSA9ICc8c3BhbiBjbGFzcz1cImJvb3RzdHJhcC10aW1lcGlja2VyLXNlY29uZFwiPjwvc3Bhbj4nO1xyXG4gICAgICAgIG1lcmlkaWFuVGVtcGxhdGUgPSAnPHNwYW4gY2xhc3M9XCJib290c3RyYXAtdGltZXBpY2tlci1tZXJpZGlhblwiPjwvc3Bhbj4nO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0ZW1wbGF0ZUNvbnRlbnQgPSAnPHRhYmxlPicrXHJcbiAgICAgICAgICc8dHI+JytcclxuICAgICAgICAgICAnPHRkPjxhIGhyZWY9XCIjXCIgZGF0YS1hY3Rpb249XCJpbmNyZW1lbnRIb3VyXCI+PHNwYW4gY2xhc3M9XCInKyB0aGlzLmljb25zLnVwICsnXCI+PC9zcGFuPjwvYT48L3RkPicrXHJcbiAgICAgICAgICAgJzx0ZCBjbGFzcz1cInNlcGFyYXRvclwiPiZuYnNwOzwvdGQ+JytcclxuICAgICAgICAgICAnPHRkPjxhIGhyZWY9XCIjXCIgZGF0YS1hY3Rpb249XCJpbmNyZW1lbnRNaW51dGVcIj48c3BhbiBjbGFzcz1cIicrIHRoaXMuaWNvbnMudXAgKydcIj48L3NwYW4+PC9hPjwvdGQ+JytcclxuICAgICAgICAgICAodGhpcy5zaG93U2Vjb25kcyA/XHJcbiAgICAgICAgICAgICAnPHRkIGNsYXNzPVwic2VwYXJhdG9yXCI+Jm5ic3A7PC90ZD4nK1xyXG4gICAgICAgICAgICAgJzx0ZD48YSBocmVmPVwiI1wiIGRhdGEtYWN0aW9uPVwiaW5jcmVtZW50U2Vjb25kXCI+PHNwYW4gY2xhc3M9XCInKyB0aGlzLmljb25zLnVwICsnXCI+PC9zcGFuPjwvYT48L3RkPidcclxuICAgICAgICAgICA6ICcnKSArXHJcbiAgICAgICAgICAgKHRoaXMuc2hvd01lcmlkaWFuID9cclxuICAgICAgICAgICAgICc8dGQgY2xhc3M9XCJzZXBhcmF0b3JcIj4mbmJzcDs8L3RkPicrXHJcbiAgICAgICAgICAgICAnPHRkIGNsYXNzPVwibWVyaWRpYW4tY29sdW1uXCI+PGEgaHJlZj1cIiNcIiBkYXRhLWFjdGlvbj1cInRvZ2dsZU1lcmlkaWFuXCI+PHNwYW4gY2xhc3M9XCInKyB0aGlzLmljb25zLnVwICsnXCI+PC9zcGFuPjwvYT48L3RkPidcclxuICAgICAgICAgICA6ICcnKSArXHJcbiAgICAgICAgICc8L3RyPicrXHJcbiAgICAgICAgICc8dHI+JytcclxuICAgICAgICAgICAnPHRkPicrIGhvdXJUZW1wbGF0ZSArJzwvdGQ+ICcrXHJcbiAgICAgICAgICAgJzx0ZCBjbGFzcz1cInNlcGFyYXRvclwiPjo8L3RkPicrXHJcbiAgICAgICAgICAgJzx0ZD4nKyBtaW51dGVUZW1wbGF0ZSArJzwvdGQ+ICcrXHJcbiAgICAgICAgICAgKHRoaXMuc2hvd1NlY29uZHMgP1xyXG4gICAgICAgICAgICAnPHRkIGNsYXNzPVwic2VwYXJhdG9yXCI+OjwvdGQ+JytcclxuICAgICAgICAgICAgJzx0ZD4nKyBzZWNvbmRUZW1wbGF0ZSArJzwvdGQ+J1xyXG4gICAgICAgICAgIDogJycpICtcclxuICAgICAgICAgICAodGhpcy5zaG93TWVyaWRpYW4gP1xyXG4gICAgICAgICAgICAnPHRkIGNsYXNzPVwic2VwYXJhdG9yXCI+Jm5ic3A7PC90ZD4nK1xyXG4gICAgICAgICAgICAnPHRkPicrIG1lcmlkaWFuVGVtcGxhdGUgKyc8L3RkPidcclxuICAgICAgICAgICA6ICcnKSArXHJcbiAgICAgICAgICc8L3RyPicrXHJcbiAgICAgICAgICc8dHI+JytcclxuICAgICAgICAgICAnPHRkPjxhIGhyZWY9XCIjXCIgZGF0YS1hY3Rpb249XCJkZWNyZW1lbnRIb3VyXCI+PHNwYW4gY2xhc3M9XCInKyB0aGlzLmljb25zLmRvd24gKydcIj48L3NwYW4+PC9hPjwvdGQ+JytcclxuICAgICAgICAgICAnPHRkIGNsYXNzPVwic2VwYXJhdG9yXCI+PC90ZD4nK1xyXG4gICAgICAgICAgICc8dGQ+PGEgaHJlZj1cIiNcIiBkYXRhLWFjdGlvbj1cImRlY3JlbWVudE1pbnV0ZVwiPjxzcGFuIGNsYXNzPVwiJysgdGhpcy5pY29ucy5kb3duICsnXCI+PC9zcGFuPjwvYT48L3RkPicrXHJcbiAgICAgICAgICAgKHRoaXMuc2hvd1NlY29uZHMgP1xyXG4gICAgICAgICAgICAnPHRkIGNsYXNzPVwic2VwYXJhdG9yXCI+Jm5ic3A7PC90ZD4nK1xyXG4gICAgICAgICAgICAnPHRkPjxhIGhyZWY9XCIjXCIgZGF0YS1hY3Rpb249XCJkZWNyZW1lbnRTZWNvbmRcIj48c3BhbiBjbGFzcz1cIicrIHRoaXMuaWNvbnMuZG93biArJ1wiPjwvc3Bhbj48L2E+PC90ZD4nXHJcbiAgICAgICAgICAgOiAnJykgK1xyXG4gICAgICAgICAgICh0aGlzLnNob3dNZXJpZGlhbiA/XHJcbiAgICAgICAgICAgICc8dGQgY2xhc3M9XCJzZXBhcmF0b3JcIj4mbmJzcDs8L3RkPicrXHJcbiAgICAgICAgICAgICc8dGQ+PGEgaHJlZj1cIiNcIiBkYXRhLWFjdGlvbj1cInRvZ2dsZU1lcmlkaWFuXCI+PHNwYW4gY2xhc3M9XCInKyB0aGlzLmljb25zLmRvd24gKydcIj48L3NwYW4+PC9hPjwvdGQ+J1xyXG4gICAgICAgICAgIDogJycpICtcclxuICAgICAgICAgJzwvdHI+JytcclxuICAgICAgICc8L3RhYmxlPic7XHJcblxyXG4gICAgICBzd2l0Y2godGhpcy50ZW1wbGF0ZSkge1xyXG4gICAgICBjYXNlICdtb2RhbCc6XHJcbiAgICAgICAgdGVtcGxhdGUgPSAnPGRpdiBjbGFzcz1cImJvb3RzdHJhcC10aW1lcGlja2VyLXdpZGdldCBtb2RhbCBoaWRlIGZhZGUgaW5cIiBkYXRhLWJhY2tkcm9wPVwiJysgKHRoaXMubW9kYWxCYWNrZHJvcCA/ICd0cnVlJyA6ICdmYWxzZScpICsnXCI+JytcclxuICAgICAgICAgICc8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+JytcclxuICAgICAgICAgICAgJzxhIGhyZWY9XCIjXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cIm1vZGFsXCI+JnRpbWVzOzwvYT4nK1xyXG4gICAgICAgICAgICAnPGgzPlBpY2sgYSBUaW1lPC9oMz4nK1xyXG4gICAgICAgICAgJzwvZGl2PicrXHJcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1vZGFsLWNvbnRlbnRcIj4nK1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZUNvbnRlbnQgK1xyXG4gICAgICAgICAgJzwvZGl2PicrXHJcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1vZGFsLWZvb3RlclwiPicrXHJcbiAgICAgICAgICAgICc8YSBocmVmPVwiI1wiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIj5PSzwvYT4nK1xyXG4gICAgICAgICAgJzwvZGl2PicrXHJcbiAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Ryb3Bkb3duJzpcclxuICAgICAgICB0ZW1wbGF0ZSA9ICc8ZGl2IGNsYXNzPVwiYm9vdHN0cmFwLXRpbWVwaWNrZXItd2lkZ2V0IGRyb3Bkb3duLW1lbnVcIj4nKyB0ZW1wbGF0ZUNvbnRlbnQgKyc8L2Rpdj4nO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdGVtcGxhdGU7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFRpbWU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAodGhpcy5ob3VyID09PSAnJykge1xyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuaG91ciArICc6JyArICh0aGlzLm1pbnV0ZS50b1N0cmluZygpLmxlbmd0aCA9PT0gMSA/ICcwJyArIHRoaXMubWludXRlIDogdGhpcy5taW51dGUpICsgKHRoaXMuc2hvd1NlY29uZHMgPyAnOicgKyAodGhpcy5zZWNvbmQudG9TdHJpbmcoKS5sZW5ndGggPT09IDEgPyAnMCcgKyB0aGlzLnNlY29uZCA6IHRoaXMuc2Vjb25kKSA6ICcnKSArICh0aGlzLnNob3dNZXJpZGlhbiA/ICcgJyArIHRoaXMubWVyaWRpYW4gOiAnJyk7XHJcbiAgICB9LFxyXG5cclxuICAgIGhpZGVXaWRnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAodGhpcy5pc09wZW4gPT09IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoe1xyXG4gICAgICAgICd0eXBlJzogJ2hpZGUudGltZXBpY2tlcicsXHJcbiAgICAgICAgJ3RpbWUnOiB7XHJcbiAgICAgICAgICAndmFsdWUnOiB0aGlzLmdldFRpbWUoKSxcclxuICAgICAgICAgICdob3Vycyc6IHRoaXMuaG91cixcclxuICAgICAgICAgICdtaW51dGVzJzogdGhpcy5taW51dGUsXHJcbiAgICAgICAgICAnc2Vjb25kcyc6IHRoaXMuc2Vjb25kLFxyXG4gICAgICAgICAgJ21lcmlkaWFuJzogdGhpcy5tZXJpZGlhblxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAodGhpcy50ZW1wbGF0ZSA9PT0gJ21vZGFsJyAmJiB0aGlzLiR3aWRnZXQubW9kYWwpIHtcclxuICAgICAgICB0aGlzLiR3aWRnZXQubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLiR3aWRnZXQucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZWRvd24udGltZXBpY2tlciwgdG91Y2hlbmQudGltZXBpY2tlcicsIHRoaXMuaGFuZGxlRG9jdW1lbnRDbGljayk7XHJcblxyXG4gICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICAvLyBzaG93L2hpZGUgYXBwcm9hY2ggdGFrZW4gYnkgZGF0ZXBpY2tlclxyXG4gICAgICB0aGlzLiR3aWRnZXQuZGV0YWNoKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGhpZ2hsaWdodFVuaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbigpO1xyXG4gICAgICBpZiAodGhpcy5wb3NpdGlvbiA+PSAwICYmIHRoaXMucG9zaXRpb24gPD0gMikge1xyXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0SG91cigpO1xyXG4gICAgICB9IGVsc2UgaWYgKHRoaXMucG9zaXRpb24gPj0gMyAmJiB0aGlzLnBvc2l0aW9uIDw9IDUpIHtcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodE1pbnV0ZSgpO1xyXG4gICAgICB9IGVsc2UgaWYgKHRoaXMucG9zaXRpb24gPj0gNiAmJiB0aGlzLnBvc2l0aW9uIDw9IDgpIHtcclxuICAgICAgICBpZiAodGhpcy5zaG93U2Vjb25kcykge1xyXG4gICAgICAgICAgdGhpcy5oaWdobGlnaHRTZWNvbmQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5oaWdobGlnaHRNZXJpZGlhbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmICh0aGlzLnBvc2l0aW9uID49IDkgJiYgdGhpcy5wb3NpdGlvbiA8PSAxMSkge1xyXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TWVyaWRpYW4oKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBoaWdobGlnaHROZXh0VW5pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHN3aXRjaCAodGhpcy5oaWdobGlnaHRlZFVuaXQpIHtcclxuICAgICAgY2FzZSAnaG91cic6XHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHRNaW51dGUoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbWludXRlJzpcclxuICAgICAgICBpZiAodGhpcy5zaG93U2Vjb25kcykge1xyXG4gICAgICAgICAgdGhpcy5oaWdobGlnaHRTZWNvbmQoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2hvd01lcmlkaWFuKXtcclxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0TWVyaWRpYW4oKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5oaWdobGlnaHRIb3VyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdzZWNvbmQnOlxyXG4gICAgICAgIGlmICh0aGlzLnNob3dNZXJpZGlhbikge1xyXG4gICAgICAgICAgdGhpcy5oaWdobGlnaHRNZXJpZGlhbigpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodEhvdXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ21lcmlkaWFuJzpcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodEhvdXIoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBoaWdobGlnaHRQcmV2VW5pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHN3aXRjaCAodGhpcy5oaWdobGlnaHRlZFVuaXQpIHtcclxuICAgICAgY2FzZSAnaG91cic6XHJcbiAgICAgICAgaWYodGhpcy5zaG93TWVyaWRpYW4pe1xyXG4gICAgICAgICAgdGhpcy5oaWdobGlnaHRNZXJpZGlhbigpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaG93U2Vjb25kcykge1xyXG4gICAgICAgICAgdGhpcy5oaWdobGlnaHRTZWNvbmQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5oaWdobGlnaHRNaW51dGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ21pbnV0ZSc6XHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHRIb3VyKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3NlY29uZCc6XHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHRNaW51dGUoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbWVyaWRpYW4nOlxyXG4gICAgICAgIGlmICh0aGlzLnNob3dTZWNvbmRzKSB7XHJcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodFNlY29uZCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodE1pbnV0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBoaWdobGlnaHRIb3VyOiBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyICRlbGVtZW50ID0gdGhpcy4kZWxlbWVudC5nZXQoMCksXHJcbiAgICAgICAgICBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgIHRoaXMuaGlnaGxpZ2h0ZWRVbml0ID0gJ2hvdXInO1xyXG5cclxuICAgICAgaWYgKCRlbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmIChzZWxmLmhvdXIgPCAxMCkge1xyXG4gICAgICAgICAgICAkZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSgwLDEpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJGVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UoMCwyKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCAwKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBoaWdobGlnaHRNaW51dGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgJGVsZW1lbnQgPSB0aGlzLiRlbGVtZW50LmdldCgwKSxcclxuICAgICAgICAgIHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgdGhpcy5oaWdobGlnaHRlZFVuaXQgPSAnbWludXRlJztcclxuXHJcbiAgICAgIGlmICgkZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSkge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBpZiAoc2VsZi5ob3VyIDwgMTApIHtcclxuICAgICAgICAgICAgJGVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UoMiw0KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRlbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKDMsNSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgaGlnaGxpZ2h0U2Vjb25kOiBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyICRlbGVtZW50ID0gdGhpcy4kZWxlbWVudC5nZXQoMCksXHJcbiAgICAgICAgICBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgIHRoaXMuaGlnaGxpZ2h0ZWRVbml0ID0gJ3NlY29uZCc7XHJcblxyXG4gICAgICBpZiAoJGVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgaWYgKHNlbGYuaG91ciA8IDEwKSB7XHJcbiAgICAgICAgICAgICRlbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKDUsNyk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSg2LDgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIDApO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGhpZ2hsaWdodE1lcmlkaWFuOiBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyICRlbGVtZW50ID0gdGhpcy4kZWxlbWVudC5nZXQoMCksXHJcbiAgICAgICAgICBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgIHRoaXMuaGlnaGxpZ2h0ZWRVbml0ID0gJ21lcmlkaWFuJztcclxuXHJcbiAgICAgIGlmICgkZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSkge1xyXG4gICAgICAgIGlmICh0aGlzLnNob3dTZWNvbmRzKSB7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5ob3VyIDwgMTApIHtcclxuICAgICAgICAgICAgICAkZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSg4LDEwKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAkZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSg5LDExKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChzZWxmLmhvdXIgPCAxMCkge1xyXG4gICAgICAgICAgICAgICRlbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKDUsNyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgJGVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UoNiw4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGluY3JlbWVudEhvdXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAodGhpcy5zaG93TWVyaWRpYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5ob3VyID09PSAxMSkge1xyXG4gICAgICAgICAgdGhpcy5ob3VyKys7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy50b2dnbGVNZXJpZGlhbigpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5ob3VyID09PSAxMikge1xyXG4gICAgICAgICAgdGhpcy5ob3VyID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMuaG91ciA9PT0gdGhpcy5tYXhIb3VycyAtIDEpIHtcclxuICAgICAgICB0aGlzLmhvdXIgPSAwO1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5ob3VyKys7XHJcbiAgICB9LFxyXG5cclxuICAgIGluY3JlbWVudE1pbnV0ZTogZnVuY3Rpb24oc3RlcCkge1xyXG4gICAgICB2YXIgbmV3VmFsO1xyXG5cclxuICAgICAgaWYgKHN0ZXApIHtcclxuICAgICAgICBuZXdWYWwgPSB0aGlzLm1pbnV0ZSArIHN0ZXA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmV3VmFsID0gdGhpcy5taW51dGUgKyB0aGlzLm1pbnV0ZVN0ZXAgLSAodGhpcy5taW51dGUgJSB0aGlzLm1pbnV0ZVN0ZXApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAobmV3VmFsID4gNTkpIHtcclxuICAgICAgICB0aGlzLmluY3JlbWVudEhvdXIoKTtcclxuICAgICAgICB0aGlzLm1pbnV0ZSA9IG5ld1ZhbCAtIDYwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubWludXRlID0gbmV3VmFsO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGluY3JlbWVudFNlY29uZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBuZXdWYWwgPSB0aGlzLnNlY29uZCArIHRoaXMuc2Vjb25kU3RlcCAtICh0aGlzLnNlY29uZCAlIHRoaXMuc2Vjb25kU3RlcCk7XHJcblxyXG4gICAgICBpZiAobmV3VmFsID4gNTkpIHtcclxuICAgICAgICB0aGlzLmluY3JlbWVudE1pbnV0ZSh0cnVlKTtcclxuICAgICAgICB0aGlzLnNlY29uZCA9IG5ld1ZhbCAtIDYwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2Vjb25kID0gbmV3VmFsO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIG1vdXNld2hlZWw6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKHRoaXMuZGlzYWJsZU1vdXNld2hlZWwpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgIHZhciBkZWx0YSA9IGUub3JpZ2luYWxFdmVudC53aGVlbERlbHRhIHx8IC1lLm9yaWdpbmFsRXZlbnQuZGV0YWlsLFxyXG4gICAgICAgICAgc2Nyb2xsVG8gPSBudWxsO1xyXG5cclxuICAgICAgaWYgKGUudHlwZSA9PT0gJ21vdXNld2hlZWwnKSB7XHJcbiAgICAgICAgc2Nyb2xsVG8gPSAoZS5vcmlnaW5hbEV2ZW50LndoZWVsRGVsdGEgKiAtMSk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoZS50eXBlID09PSAnRE9NTW91c2VTY3JvbGwnKSB7XHJcbiAgICAgICAgc2Nyb2xsVG8gPSA0MCAqIGUub3JpZ2luYWxFdmVudC5kZXRhaWw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzY3JvbGxUbykge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAkKHRoaXMpLnNjcm9sbFRvcChzY3JvbGxUbyArICQodGhpcykuc2Nyb2xsVG9wKCkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzd2l0Y2ggKHRoaXMuaGlnaGxpZ2h0ZWRVbml0KSB7XHJcbiAgICAgIGNhc2UgJ21pbnV0ZSc6XHJcbiAgICAgICAgaWYgKGRlbHRhID4gMCkge1xyXG4gICAgICAgICAgdGhpcy5pbmNyZW1lbnRNaW51dGUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5kZWNyZW1lbnRNaW51dGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHRNaW51dGUoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnc2Vjb25kJzpcclxuICAgICAgICBpZiAoZGVsdGEgPiAwKSB7XHJcbiAgICAgICAgICB0aGlzLmluY3JlbWVudFNlY29uZCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmRlY3JlbWVudFNlY29uZCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhpZ2hsaWdodFNlY29uZCgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdtZXJpZGlhbic6XHJcbiAgICAgICAgdGhpcy50b2dnbGVNZXJpZGlhbigpO1xyXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TWVyaWRpYW4oKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBpZiAoZGVsdGEgPiAwKSB7XHJcbiAgICAgICAgICB0aGlzLmluY3JlbWVudEhvdXIoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5kZWNyZW1lbnRIb3VyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0SG91cigpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2l2ZW4gYSBzZWdtZW50IHZhbHVlIGxpa2UgNDMsIHdpbGwgcm91bmQgYW5kIHNuYXAgdGhlIHNlZ21lbnRcclxuICAgICAqIHRvIHRoZSBuZWFyZXN0IFwic3RlcFwiLCBsaWtlIDQ1IGlmIHN0ZXAgaXMgMTUuIFNlZ21lbnQgd2lsbFxyXG4gICAgICogXCJvdmVyZmxvd1wiIHRvIDAgaWYgaXQncyBsYXJnZXIgdGhhbiA1OSBvciB3b3VsZCBvdGhlcndpc2VcclxuICAgICAqIHJvdW5kIHVwIHRvIDYwLlxyXG4gICAgICovXHJcbiAgICBjaGFuZ2VUb05lYXJlc3RTdGVwOiBmdW5jdGlvbiAoc2VnbWVudCwgc3RlcCkge1xyXG4gICAgICBpZiAoc2VnbWVudCAlIHN0ZXAgPT09IDApIHtcclxuICAgICAgICByZXR1cm4gc2VnbWVudDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoTWF0aC5yb3VuZCgoc2VnbWVudCAlIHN0ZXApIC8gc3RlcCkpIHtcclxuICAgICAgICByZXR1cm4gKHNlZ21lbnQgKyAoc3RlcCAtIHNlZ21lbnQgJSBzdGVwKSkgJSA2MDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gc2VnbWVudCAtIHNlZ21lbnQgJSBzdGVwO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFRoaXMgbWV0aG9kIHdhcyBhZGFwdGVkIGZyb20gYm9vdHN0cmFwLWRhdGVwaWNrZXIuXHJcbiAgICBwbGFjZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAodGhpcy5pc0lubGluZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB2YXIgd2lkZ2V0V2lkdGggPSB0aGlzLiR3aWRnZXQub3V0ZXJXaWR0aCgpLCB3aWRnZXRIZWlnaHQgPSB0aGlzLiR3aWRnZXQub3V0ZXJIZWlnaHQoKSwgdmlzdWFsUGFkZGluZyA9IDEwLCB3aW5kb3dXaWR0aCA9XHJcbiAgICAgICAgJCh3aW5kb3cpLndpZHRoKCksIHdpbmRvd0hlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKSwgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG5cclxuICAgICAgdmFyIHpJbmRleCA9IHBhcnNlSW50KHRoaXMuJGVsZW1lbnQucGFyZW50cygpLmZpbHRlcihmdW5jdGlvbigpIHsgcmV0dXJuICQodGhpcykuY3NzKCd6LWluZGV4JykgIT09ICdhdXRvJzsgfSkuZmlyc3QoKS5jc3MoJ3otaW5kZXgnKSwgMTApICsgMTA7XHJcbiAgICAgIHZhciBvZmZzZXQgPSB0aGlzLmNvbXBvbmVudCA/IHRoaXMuY29tcG9uZW50LnBhcmVudCgpLm9mZnNldCgpIDogdGhpcy4kZWxlbWVudC5vZmZzZXQoKTtcclxuICAgICAgdmFyIGhlaWdodCA9IHRoaXMuY29tcG9uZW50ID8gdGhpcy5jb21wb25lbnQub3V0ZXJIZWlnaHQodHJ1ZSkgOiB0aGlzLiRlbGVtZW50Lm91dGVySGVpZ2h0KGZhbHNlKTtcclxuICAgICAgdmFyIHdpZHRoID0gdGhpcy5jb21wb25lbnQgPyB0aGlzLmNvbXBvbmVudC5vdXRlcldpZHRoKHRydWUpIDogdGhpcy4kZWxlbWVudC5vdXRlcldpZHRoKGZhbHNlKTtcclxuICAgICAgdmFyIGxlZnQgPSBvZmZzZXQubGVmdCwgdG9wID0gb2Zmc2V0LnRvcDtcclxuXHJcbiAgICAgIHRoaXMuJHdpZGdldC5yZW1vdmVDbGFzcygndGltZXBpY2tlci1vcmllbnQtdG9wIHRpbWVwaWNrZXItb3JpZW50LWJvdHRvbSB0aW1lcGlja2VyLW9yaWVudC1yaWdodCB0aW1lcGlja2VyLW9yaWVudC1sZWZ0Jyk7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcmllbnRhdGlvbi54ICE9PSAnYXV0bycpIHtcclxuICAgICAgICB0aGlzLiR3aWRnZXQuYWRkQ2xhc3MoJ3RpbWVwaWNrZXItb3JpZW50LScgKyB0aGlzLm9yaWVudGF0aW9uLngpO1xyXG4gICAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uLnggPT09ICdyaWdodCcpIHtcclxuICAgICAgICAgIGxlZnQgLT0gd2lkZ2V0V2lkdGggLSB3aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZXtcclxuICAgICAgICAvLyBhdXRvIHggb3JpZW50YXRpb24gaXMgYmVzdC1wbGFjZW1lbnQ6IGlmIGl0IGNyb3NzZXMgYSB3aW5kb3cgZWRnZSwgZnVkZ2UgaXQgc2lkZXdheXNcclxuICAgICAgICAvLyBEZWZhdWx0IHRvIGxlZnRcclxuICAgICAgICB0aGlzLiR3aWRnZXQuYWRkQ2xhc3MoJ3RpbWVwaWNrZXItb3JpZW50LWxlZnQnKTtcclxuICAgICAgICBpZiAob2Zmc2V0LmxlZnQgPCAwKSB7XHJcbiAgICAgICAgICBsZWZ0IC09IG9mZnNldC5sZWZ0IC0gdmlzdWFsUGFkZGluZztcclxuICAgICAgICB9IGVsc2UgaWYgKG9mZnNldC5sZWZ0ICsgd2lkZ2V0V2lkdGggPiB3aW5kb3dXaWR0aCkge1xyXG4gICAgICAgICAgbGVmdCA9IHdpbmRvd1dpZHRoIC0gd2lkZ2V0V2lkdGggLSB2aXN1YWxQYWRkaW5nO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyBhdXRvIHkgb3JpZW50YXRpb24gaXMgYmVzdC1zaXR1YXRpb246IHRvcCBvciBib3R0b20sIG5vIGZ1ZGdpbmcsIGRlY2lzaW9uIGJhc2VkIG9uIHdoaWNoIHNob3dzIG1vcmUgb2YgdGhlIHdpZGdldFxyXG4gICAgICB2YXIgeW9yaWVudCA9IHRoaXMub3JpZW50YXRpb24ueSwgdG9wT3ZlcmZsb3csIGJvdHRvbU92ZXJmbG93O1xyXG4gICAgICBpZiAoeW9yaWVudCA9PT0gJ2F1dG8nKSB7XHJcbiAgICAgICAgdG9wT3ZlcmZsb3cgPSAtc2Nyb2xsVG9wICsgb2Zmc2V0LnRvcCAtIHdpZGdldEhlaWdodDtcclxuICAgICAgICBib3R0b21PdmVyZmxvdyA9IHNjcm9sbFRvcCArIHdpbmRvd0hlaWdodCAtIChvZmZzZXQudG9wICsgaGVpZ2h0ICsgd2lkZ2V0SGVpZ2h0KTtcclxuICAgICAgICBpZiAoTWF0aC5tYXgodG9wT3ZlcmZsb3csIGJvdHRvbU92ZXJmbG93KSA9PT0gYm90dG9tT3ZlcmZsb3cpIHtcclxuICAgICAgICAgIHlvcmllbnQgPSAndG9wJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgeW9yaWVudCA9ICdib3R0b20nO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICB0aGlzLiR3aWRnZXQuYWRkQ2xhc3MoJ3RpbWVwaWNrZXItb3JpZW50LScgKyB5b3JpZW50KTtcclxuICAgICAgaWYgKHlvcmllbnQgPT09ICd0b3AnKXtcclxuICAgICAgICB0b3AgKz0gaGVpZ2h0O1xyXG4gICAgICB9IGVsc2V7XHJcbiAgICAgICAgdG9wIC09IHdpZGdldEhlaWdodCArIHBhcnNlSW50KHRoaXMuJHdpZGdldC5jc3MoJ3BhZGRpbmctdG9wJyksIDEwKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy4kd2lkZ2V0LmNzcyh7XHJcbiAgICAgICAgdG9wIDogdG9wLFxyXG4gICAgICAgIGxlZnQgOiBsZWZ0LFxyXG4gICAgICAgIHpJbmRleCA6IHpJbmRleFxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcclxuICAgICAgJCgnZG9jdW1lbnQnKS5vZmYoJy50aW1lcGlja2VyJyk7XHJcbiAgICAgIGlmICh0aGlzLiR3aWRnZXQpIHtcclxuICAgICAgICB0aGlzLiR3aWRnZXQucmVtb3ZlKCk7XHJcbiAgICAgIH1cclxuICAgICAgZGVsZXRlIHRoaXMuJGVsZW1lbnQuZGF0YSgpLnRpbWVwaWNrZXI7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldERlZmF1bHRUaW1lOiBmdW5jdGlvbihkZWZhdWx0VGltZSkge1xyXG4gICAgICBpZiAoIXRoaXMuJGVsZW1lbnQudmFsKCkpIHtcclxuICAgICAgICBpZiAoZGVmYXVsdFRpbWUgPT09ICdjdXJyZW50Jykge1xyXG4gICAgICAgICAgdmFyIGRUaW1lID0gbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgaG91cnMgPSBkVGltZS5nZXRIb3VycygpLFxyXG4gICAgICAgICAgICBtaW51dGVzID0gZFRpbWUuZ2V0TWludXRlcygpLFxyXG4gICAgICAgICAgICBzZWNvbmRzID0gZFRpbWUuZ2V0U2Vjb25kcygpLFxyXG4gICAgICAgICAgICBtZXJpZGlhbiA9ICdBTSc7XHJcblxyXG4gICAgICAgICAgaWYgKHNlY29uZHMgIT09IDApIHtcclxuICAgICAgICAgICAgc2Vjb25kcyA9IE1hdGguY2VpbChkVGltZS5nZXRTZWNvbmRzKCkgLyB0aGlzLnNlY29uZFN0ZXApICogdGhpcy5zZWNvbmRTdGVwO1xyXG4gICAgICAgICAgICBpZiAoc2Vjb25kcyA9PT0gNjApIHtcclxuICAgICAgICAgICAgICBtaW51dGVzICs9IDE7XHJcbiAgICAgICAgICAgICAgc2Vjb25kcyA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAobWludXRlcyAhPT0gMCkge1xyXG4gICAgICAgICAgICBtaW51dGVzID0gTWF0aC5jZWlsKGRUaW1lLmdldE1pbnV0ZXMoKSAvIHRoaXMubWludXRlU3RlcCkgKiB0aGlzLm1pbnV0ZVN0ZXA7XHJcbiAgICAgICAgICAgIGlmIChtaW51dGVzID09PSA2MCkge1xyXG4gICAgICAgICAgICAgIGhvdXJzICs9IDE7XHJcbiAgICAgICAgICAgICAgbWludXRlcyA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAodGhpcy5zaG93TWVyaWRpYW4pIHtcclxuICAgICAgICAgICAgaWYgKGhvdXJzID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgaG91cnMgPSAxMjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChob3VycyA+PSAxMikge1xyXG4gICAgICAgICAgICAgIGlmIChob3VycyA+IDEyKSB7XHJcbiAgICAgICAgICAgICAgICBob3VycyA9IGhvdXJzIC0gMTI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIG1lcmlkaWFuID0gJ1BNJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBtZXJpZGlhbiA9ICdBTSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLmhvdXIgPSBob3VycztcclxuICAgICAgICAgIHRoaXMubWludXRlID0gbWludXRlcztcclxuICAgICAgICAgIHRoaXMuc2Vjb25kID0gc2Vjb25kcztcclxuICAgICAgICAgIHRoaXMubWVyaWRpYW4gPSBtZXJpZGlhbjtcclxuXHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKGRlZmF1bHRUaW1lID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgdGhpcy5ob3VyID0gMDtcclxuICAgICAgICAgIHRoaXMubWludXRlID0gMDtcclxuICAgICAgICAgIHRoaXMuc2Vjb25kID0gMDtcclxuICAgICAgICAgIHRoaXMubWVyaWRpYW4gPSAnQU0nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnNldFRpbWUoZGVmYXVsdFRpbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUZyb21FbGVtZW50VmFsKCk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2V0VGltZTogZnVuY3Rpb24odGltZSwgaWdub3JlV2lkZ2V0KSB7XHJcbiAgICAgIGlmICghdGltZSkge1xyXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciB0aW1lTW9kZSxcclxuICAgICAgICAgIHRpbWVBcnJheSxcclxuICAgICAgICAgIGhvdXIsXHJcbiAgICAgICAgICBtaW51dGUsXHJcbiAgICAgICAgICBzZWNvbmQsXHJcbiAgICAgICAgICBtZXJpZGlhbjtcclxuXHJcbiAgICAgIGlmICh0eXBlb2YgdGltZSA9PT0gJ29iamVjdCcgJiYgdGltZS5nZXRNb250aCl7XHJcbiAgICAgICAgLy8gdGhpcyBpcyBhIGRhdGUgb2JqZWN0XHJcbiAgICAgICAgaG91ciAgICA9IHRpbWUuZ2V0SG91cnMoKTtcclxuICAgICAgICBtaW51dGUgID0gdGltZS5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgc2Vjb25kICA9IHRpbWUuZ2V0U2Vjb25kcygpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zaG93TWVyaWRpYW4pe1xyXG4gICAgICAgICAgbWVyaWRpYW4gPSAnQU0nO1xyXG4gICAgICAgICAgaWYgKGhvdXIgPiAxMil7XHJcbiAgICAgICAgICAgIG1lcmlkaWFuID0gJ1BNJztcclxuICAgICAgICAgICAgaG91ciA9IGhvdXIgJSAxMjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoaG91ciA9PT0gMTIpe1xyXG4gICAgICAgICAgICBtZXJpZGlhbiA9ICdQTSc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRpbWVNb2RlID0gKCgvYS9pKS50ZXN0KHRpbWUpID8gMSA6IDApICsgKCgvcC9pKS50ZXN0KHRpbWUpID8gMiA6IDApOyAvLyAwID0gbm9uZSwgMSA9IEFNLCAyID0gUE0sIDMgPSBCT1RILlxyXG4gICAgICAgIGlmICh0aW1lTW9kZSA+IDIpIHsgLy8gSWYgYm90aCBhcmUgcHJlc2VudCwgZmFpbC5cclxuICAgICAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRpbWVBcnJheSA9IHRpbWUucmVwbGFjZSgvW14wLTlcXDpdL2csICcnKS5zcGxpdCgnOicpO1xyXG5cclxuICAgICAgICBob3VyID0gdGltZUFycmF5WzBdID8gdGltZUFycmF5WzBdLnRvU3RyaW5nKCkgOiB0aW1lQXJyYXkudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5leHBsaWNpdE1vZGUgJiYgaG91ci5sZW5ndGggPiAyICYmIChob3VyLmxlbmd0aCAlIDIpICE9PSAwICkge1xyXG4gICAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbWludXRlID0gdGltZUFycmF5WzFdID8gdGltZUFycmF5WzFdLnRvU3RyaW5nKCkgOiAnJztcclxuICAgICAgICBzZWNvbmQgPSB0aW1lQXJyYXlbMl0gPyB0aW1lQXJyYXlbMl0udG9TdHJpbmcoKSA6ICcnO1xyXG5cclxuICAgICAgICAvLyBhZGFwdGl2ZSB0aW1lIHBhcnNpbmdcclxuICAgICAgICBpZiAoaG91ci5sZW5ndGggPiA0KSB7XHJcbiAgICAgICAgICBzZWNvbmQgPSBob3VyLnNsaWNlKC0yKTtcclxuICAgICAgICAgIGhvdXIgPSBob3VyLnNsaWNlKDAsIC0yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChob3VyLmxlbmd0aCA+IDIpIHtcclxuICAgICAgICAgIG1pbnV0ZSA9IGhvdXIuc2xpY2UoLTIpO1xyXG4gICAgICAgICAgaG91ciA9IGhvdXIuc2xpY2UoMCwgLTIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1pbnV0ZS5sZW5ndGggPiAyKSB7XHJcbiAgICAgICAgICBzZWNvbmQgPSBtaW51dGUuc2xpY2UoLTIpO1xyXG4gICAgICAgICAgbWludXRlID0gbWludXRlLnNsaWNlKDAsIC0yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGhvdXIgPSBwYXJzZUludChob3VyLCAxMCk7XHJcbiAgICAgICAgbWludXRlID0gcGFyc2VJbnQobWludXRlLCAxMCk7XHJcbiAgICAgICAgc2Vjb25kID0gcGFyc2VJbnQoc2Vjb25kLCAxMCk7XHJcblxyXG4gICAgICAgIGlmIChpc05hTihob3VyKSkge1xyXG4gICAgICAgICAgaG91ciA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTihtaW51dGUpKSB7XHJcbiAgICAgICAgICBtaW51dGUgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4oc2Vjb25kKSkge1xyXG4gICAgICAgICAgc2Vjb25kID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFkanVzdCB0aGUgdGltZSBiYXNlZCB1cG9uIHVuaXQgYm91bmRhcnkuXHJcbiAgICAgICAgLy8gTk9URTogTmVnYXRpdmVzIHdpbGwgbmV2ZXIgb2NjdXIgZHVlIHRvIHRpbWUucmVwbGFjZSgpIGFib3ZlLlxyXG4gICAgICAgIGlmIChzZWNvbmQgPiA1OSkge1xyXG4gICAgICAgICAgc2Vjb25kID0gNTk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobWludXRlID4gNTkpIHtcclxuICAgICAgICAgIG1pbnV0ZSA9IDU5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGhvdXIgPj0gdGhpcy5tYXhIb3Vycykge1xyXG4gICAgICAgICAgLy8gTm8gZGF5L2RhdGUgaGFuZGxpbmcuXHJcbiAgICAgICAgICBob3VyID0gdGhpcy5tYXhIb3VycyAtIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5zaG93TWVyaWRpYW4pIHtcclxuICAgICAgICAgIGlmIChob3VyID4gMTIpIHtcclxuICAgICAgICAgICAgLy8gRm9yY2UgUE0uXHJcbiAgICAgICAgICAgIHRpbWVNb2RlID0gMjtcclxuICAgICAgICAgICAgaG91ciAtPSAxMjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICghdGltZU1vZGUpIHtcclxuICAgICAgICAgICAgdGltZU1vZGUgPSAxO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGhvdXIgPT09IDApIHtcclxuICAgICAgICAgICAgaG91ciA9IDEyOyAvLyBBTSBvciBQTSwgcmVzZXQgdG8gMTIuICAwIEFNID0gMTIgQU0uICAwIFBNID0gMTIgUE0sIGV0Yy5cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG1lcmlkaWFuID0gdGltZU1vZGUgPT09IDEgPyAnQU0nIDogJ1BNJztcclxuICAgICAgICB9IGVsc2UgaWYgKGhvdXIgPCAxMiAmJiB0aW1lTW9kZSA9PT0gMikge1xyXG4gICAgICAgICAgaG91ciArPSAxMjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKGhvdXIgPj0gdGhpcy5tYXhIb3Vycykge1xyXG4gICAgICAgICAgICBob3VyID0gdGhpcy5tYXhIb3VycyAtIDE7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKChob3VyIDwgMCkgfHwgKGhvdXIgPT09IDEyICYmIHRpbWVNb2RlID09PSAxKSl7XHJcbiAgICAgICAgICAgIGhvdXIgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5ob3VyID0gaG91cjtcclxuICAgICAgaWYgKHRoaXMuc25hcFRvU3RlcCkge1xyXG4gICAgICAgIHRoaXMubWludXRlID0gdGhpcy5jaGFuZ2VUb05lYXJlc3RTdGVwKG1pbnV0ZSwgdGhpcy5taW51dGVTdGVwKTtcclxuICAgICAgICB0aGlzLnNlY29uZCA9IHRoaXMuY2hhbmdlVG9OZWFyZXN0U3RlcChzZWNvbmQsIHRoaXMuc2Vjb25kU3RlcCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5taW51dGUgPSBtaW51dGU7XHJcbiAgICAgICAgdGhpcy5zZWNvbmQgPSBzZWNvbmQ7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5tZXJpZGlhbiA9IG1lcmlkaWFuO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGUoaWdub3JlV2lkZ2V0KTtcclxuICAgIH0sXHJcblxyXG4gICAgc2hvd1dpZGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICh0aGlzLmlzT3Blbikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuJGVsZW1lbnQuaXMoJzpkaXNhYmxlZCcpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBzaG93L2hpZGUgYXBwcm9hY2ggdGFrZW4gYnkgZGF0ZXBpY2tlclxyXG4gICAgICB0aGlzLiR3aWRnZXQuYXBwZW5kVG8odGhpcy5hcHBlbmRXaWRnZXRUbyk7XHJcbiAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZWRvd24udGltZXBpY2tlciwgdG91Y2hlbmQudGltZXBpY2tlcicsIHtzY29wZTogdGhpc30sIHRoaXMuaGFuZGxlRG9jdW1lbnRDbGljayk7XHJcblxyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoe1xyXG4gICAgICAgICd0eXBlJzogJ3Nob3cudGltZXBpY2tlcicsXHJcbiAgICAgICAgJ3RpbWUnOiB7XHJcbiAgICAgICAgICAndmFsdWUnOiB0aGlzLmdldFRpbWUoKSxcclxuICAgICAgICAgICdob3Vycyc6IHRoaXMuaG91cixcclxuICAgICAgICAgICdtaW51dGVzJzogdGhpcy5taW51dGUsXHJcbiAgICAgICAgICAnc2Vjb25kcyc6IHRoaXMuc2Vjb25kLFxyXG4gICAgICAgICAgJ21lcmlkaWFuJzogdGhpcy5tZXJpZGlhblxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnBsYWNlKCk7XHJcbiAgICAgIGlmICh0aGlzLmRpc2FibGVGb2N1cykge1xyXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYmx1cigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB3aWRnZXQgc2hvdWxkbid0IGJlIGVtcHR5IG9uIG9wZW5cclxuICAgICAgaWYgKHRoaXMuaG91ciA9PT0gJycpIHtcclxuICAgICAgICBpZiAodGhpcy5kZWZhdWx0VGltZSkge1xyXG4gICAgICAgICAgdGhpcy5zZXREZWZhdWx0VGltZSh0aGlzLmRlZmF1bHRUaW1lKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5zZXRUaW1lKCcwOjA6MCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMudGVtcGxhdGUgPT09ICdtb2RhbCcgJiYgdGhpcy4kd2lkZ2V0Lm1vZGFsKSB7XHJcbiAgICAgICAgdGhpcy4kd2lkZ2V0Lm1vZGFsKCdzaG93Jykub24oJ2hpZGRlbicsICQucHJveHkodGhpcy5oaWRlV2lkZ2V0LCB0aGlzKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNPcGVuID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgdGhpcy4kd2lkZ2V0LmFkZENsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIHRvZ2dsZU1lcmlkaWFuOiBmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy5tZXJpZGlhbiA9IHRoaXMubWVyaWRpYW4gPT09ICdBTScgPyAnUE0nIDogJ0FNJztcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbihpZ25vcmVXaWRnZXQpIHtcclxuICAgICAgdGhpcy51cGRhdGVFbGVtZW50KCk7XHJcbiAgICAgIGlmICghaWdub3JlV2lkZ2V0KSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVXaWRnZXQoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKHtcclxuICAgICAgICAndHlwZSc6ICdjaGFuZ2VUaW1lLnRpbWVwaWNrZXInLFxyXG4gICAgICAgICd0aW1lJzoge1xyXG4gICAgICAgICAgJ3ZhbHVlJzogdGhpcy5nZXRUaW1lKCksXHJcbiAgICAgICAgICAnaG91cnMnOiB0aGlzLmhvdXIsXHJcbiAgICAgICAgICAnbWludXRlcyc6IHRoaXMubWludXRlLFxyXG4gICAgICAgICAgJ3NlY29uZHMnOiB0aGlzLnNlY29uZCxcclxuICAgICAgICAgICdtZXJpZGlhbic6IHRoaXMubWVyaWRpYW5cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVFbGVtZW50OiBmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC52YWwodGhpcy5nZXRUaW1lKCkpLmNoYW5nZSgpO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVGcm9tRWxlbWVudFZhbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuc2V0VGltZSh0aGlzLiRlbGVtZW50LnZhbCgpKTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlV2lkZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKHRoaXMuJHdpZGdldCA9PT0gZmFsc2UpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBob3VyID0gdGhpcy5ob3VyLFxyXG4gICAgICAgICAgbWludXRlID0gdGhpcy5taW51dGUudG9TdHJpbmcoKS5sZW5ndGggPT09IDEgPyAnMCcgKyB0aGlzLm1pbnV0ZSA6IHRoaXMubWludXRlLFxyXG4gICAgICAgICAgc2Vjb25kID0gdGhpcy5zZWNvbmQudG9TdHJpbmcoKS5sZW5ndGggPT09IDEgPyAnMCcgKyB0aGlzLnNlY29uZCA6IHRoaXMuc2Vjb25kO1xyXG5cclxuICAgICAgaWYgKHRoaXMuc2hvd0lucHV0cykge1xyXG4gICAgICAgIHRoaXMuJHdpZGdldC5maW5kKCdpbnB1dC5ib290c3RyYXAtdGltZXBpY2tlci1ob3VyJykudmFsKGhvdXIpO1xyXG4gICAgICAgIHRoaXMuJHdpZGdldC5maW5kKCdpbnB1dC5ib290c3RyYXAtdGltZXBpY2tlci1taW51dGUnKS52YWwobWludXRlKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2hvd1NlY29uZHMpIHtcclxuICAgICAgICAgIHRoaXMuJHdpZGdldC5maW5kKCdpbnB1dC5ib290c3RyYXAtdGltZXBpY2tlci1zZWNvbmQnKS52YWwoc2Vjb25kKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc2hvd01lcmlkaWFuKSB7XHJcbiAgICAgICAgICB0aGlzLiR3aWRnZXQuZmluZCgnaW5wdXQuYm9vdHN0cmFwLXRpbWVwaWNrZXItbWVyaWRpYW4nKS52YWwodGhpcy5tZXJpZGlhbik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuJHdpZGdldC5maW5kKCdzcGFuLmJvb3RzdHJhcC10aW1lcGlja2VyLWhvdXInKS50ZXh0KGhvdXIpO1xyXG4gICAgICAgIHRoaXMuJHdpZGdldC5maW5kKCdzcGFuLmJvb3RzdHJhcC10aW1lcGlja2VyLW1pbnV0ZScpLnRleHQobWludXRlKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2hvd1NlY29uZHMpIHtcclxuICAgICAgICAgIHRoaXMuJHdpZGdldC5maW5kKCdzcGFuLmJvb3RzdHJhcC10aW1lcGlja2VyLXNlY29uZCcpLnRleHQoc2Vjb25kKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc2hvd01lcmlkaWFuKSB7XHJcbiAgICAgICAgICB0aGlzLiR3aWRnZXQuZmluZCgnc3Bhbi5ib290c3RyYXAtdGltZXBpY2tlci1tZXJpZGlhbicpLnRleHQodGhpcy5tZXJpZGlhbik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZUZyb21XaWRnZXRJbnB1dHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAodGhpcy4kd2lkZ2V0ID09PSBmYWxzZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHQgPSB0aGlzLiR3aWRnZXQuZmluZCgnaW5wdXQuYm9vdHN0cmFwLXRpbWVwaWNrZXItaG91cicpLnZhbCgpICsgJzonICtcclxuICAgICAgICAgICAgICB0aGlzLiR3aWRnZXQuZmluZCgnaW5wdXQuYm9vdHN0cmFwLXRpbWVwaWNrZXItbWludXRlJykudmFsKCkgK1xyXG4gICAgICAgICAgICAgICh0aGlzLnNob3dTZWNvbmRzID8gJzonICsgdGhpcy4kd2lkZ2V0LmZpbmQoJ2lucHV0LmJvb3RzdHJhcC10aW1lcGlja2VyLXNlY29uZCcpLnZhbCgpIDogJycpICtcclxuICAgICAgICAgICAgICAodGhpcy5zaG93TWVyaWRpYW4gPyB0aGlzLiR3aWRnZXQuZmluZCgnaW5wdXQuYm9vdHN0cmFwLXRpbWVwaWNrZXItbWVyaWRpYW4nKS52YWwoKSA6ICcnKVxyXG4gICAgICA7XHJcblxyXG4gICAgICB0aGlzLnNldFRpbWUodCwgdHJ1ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHdpZGdldENsaWNrOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgIHZhciAkaW5wdXQgPSAkKGUudGFyZ2V0KSxcclxuICAgICAgICAgIGFjdGlvbiA9ICRpbnB1dC5jbG9zZXN0KCdhJykuZGF0YSgnYWN0aW9uJyk7XHJcblxyXG4gICAgICBpZiAoYWN0aW9uKSB7XHJcbiAgICAgICAgdGhpc1thY3Rpb25dKCk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICAgIGlmICgkaW5wdXQuaXMoJ2lucHV0JykpIHtcclxuICAgICAgICAkaW5wdXQuZ2V0KDApLnNldFNlbGVjdGlvblJhbmdlKDAsMik7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgd2lkZ2V0S2V5ZG93bjogZnVuY3Rpb24oZSkge1xyXG4gICAgICB2YXIgJGlucHV0ID0gJChlLnRhcmdldCksXHJcbiAgICAgICAgICBuYW1lID0gJGlucHV0LmF0dHIoJ2NsYXNzJykucmVwbGFjZSgnYm9vdHN0cmFwLXRpbWVwaWNrZXItJywgJycpO1xyXG5cclxuICAgICAgc3dpdGNoIChlLndoaWNoKSB7XHJcbiAgICAgIGNhc2UgOTogLy90YWJcclxuICAgICAgICBpZiAoZS5zaGlmdEtleSkge1xyXG4gICAgICAgICAgaWYgKG5hbWUgPT09ICdob3VyJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oaWRlV2lkZ2V0KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5zaG93TWVyaWRpYW4gJiYgbmFtZSA9PT0gJ21lcmlkaWFuJykgfHwgKHRoaXMuc2hvd1NlY29uZHMgJiYgbmFtZSA9PT0gJ3NlY29uZCcpIHx8ICghdGhpcy5zaG93TWVyaWRpYW4gJiYgIXRoaXMuc2hvd1NlY29uZHMgJiYgbmFtZSA9PT0gJ21pbnV0ZScpKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5oaWRlV2lkZ2V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDI3OiAvLyBlc2NhcGVcclxuICAgICAgICB0aGlzLmhpZGVXaWRnZXQoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAzODogLy8gdXAgYXJyb3dcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc3dpdGNoIChuYW1lKSB7XHJcbiAgICAgICAgY2FzZSAnaG91cic6XHJcbiAgICAgICAgICB0aGlzLmluY3JlbWVudEhvdXIoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ21pbnV0ZSc6XHJcbiAgICAgICAgICB0aGlzLmluY3JlbWVudE1pbnV0ZSgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnc2Vjb25kJzpcclxuICAgICAgICAgIHRoaXMuaW5jcmVtZW50U2Vjb25kKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdtZXJpZGlhbic6XHJcbiAgICAgICAgICB0aGlzLnRvZ2dsZU1lcmlkaWFuKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXRUaW1lKHRoaXMuZ2V0VGltZSgpKTtcclxuICAgICAgICAkaW5wdXQuZ2V0KDApLnNldFNlbGVjdGlvblJhbmdlKDAsMik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNDA6IC8vIGRvd24gYXJyb3dcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc3dpdGNoIChuYW1lKSB7XHJcbiAgICAgICAgY2FzZSAnaG91cic6XHJcbiAgICAgICAgICB0aGlzLmRlY3JlbWVudEhvdXIoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ21pbnV0ZSc6XHJcbiAgICAgICAgICB0aGlzLmRlY3JlbWVudE1pbnV0ZSgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnc2Vjb25kJzpcclxuICAgICAgICAgIHRoaXMuZGVjcmVtZW50U2Vjb25kKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdtZXJpZGlhbic6XHJcbiAgICAgICAgICB0aGlzLnRvZ2dsZU1lcmlkaWFuKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXRUaW1lKHRoaXMuZ2V0VGltZSgpKTtcclxuICAgICAgICAkaW5wdXQuZ2V0KDApLnNldFNlbGVjdGlvblJhbmdlKDAsMik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgd2lkZ2V0S2V5dXA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKChlLndoaWNoID09PSA2NSkgfHwgKGUud2hpY2ggPT09IDc3KSB8fCAoZS53aGljaCA9PT0gODApIHx8IChlLndoaWNoID09PSA0NikgfHwgKGUud2hpY2ggPT09IDgpIHx8IChlLndoaWNoID49IDQ4ICYmIGUud2hpY2ggPD0gNTcpIHx8IChlLndoaWNoID49IDk2ICYmIGUud2hpY2ggPD0gMTA1KSkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlRnJvbVdpZGdldElucHV0cygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLy9USU1FUElDS0VSIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgJC5mbi50aW1lcGlja2VyID0gZnVuY3Rpb24ob3B0aW9uKSB7XHJcbiAgICB2YXIgYXJncyA9IEFycmF5LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XHJcbiAgICBhcmdzLnNoaWZ0KCk7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxyXG4gICAgICAgIGRhdGEgPSAkdGhpcy5kYXRhKCd0aW1lcGlja2VyJyksXHJcbiAgICAgICAgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb24gPT09ICdvYmplY3QnICYmIG9wdGlvbjtcclxuXHJcbiAgICAgIGlmICghZGF0YSkge1xyXG4gICAgICAgICR0aGlzLmRhdGEoJ3RpbWVwaWNrZXInLCAoZGF0YSA9IG5ldyBUaW1lcGlja2VyKHRoaXMsICQuZXh0ZW5kKHt9LCAkLmZuLnRpbWVwaWNrZXIuZGVmYXVsdHMsIG9wdGlvbnMsICQodGhpcykuZGF0YSgpKSkpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgZGF0YVtvcHRpb25dLmFwcGx5KGRhdGEsIGFyZ3MpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICAkLmZuLnRpbWVwaWNrZXIuZGVmYXVsdHMgPSB7XHJcbiAgICBkZWZhdWx0VGltZTogJ2N1cnJlbnQnLFxyXG4gICAgZGlzYWJsZUZvY3VzOiBmYWxzZSxcclxuICAgIGRpc2FibGVNb3VzZXdoZWVsOiBmYWxzZSxcclxuICAgIGlzT3BlbjogZmFsc2UsXHJcbiAgICBtaW51dGVTdGVwOiAxNSxcclxuICAgIG1vZGFsQmFja2Ryb3A6IGZhbHNlLFxyXG4gICAgb3JpZW50YXRpb246IHsgeDogJ2F1dG8nLCB5OiAnYXV0byd9LFxyXG4gICAgc2Vjb25kU3RlcDogMTUsXHJcbiAgICBzbmFwVG9TdGVwOiBmYWxzZSxcclxuICAgIHNob3dTZWNvbmRzOiBmYWxzZSxcclxuICAgIHNob3dJbnB1dHM6IHRydWUsXHJcbiAgICBzaG93TWVyaWRpYW46IHRydWUsXHJcbiAgICB0ZW1wbGF0ZTogJ2Ryb3Bkb3duJyxcclxuICAgIGFwcGVuZFdpZGdldFRvOiAnYm9keScsXHJcbiAgICBzaG93V2lkZ2V0T25BZGRvbkNsaWNrOiB0cnVlLFxyXG4gICAgaWNvbnM6IHtcclxuICAgICAgdXA6ICdnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tdXAnLFxyXG4gICAgICBkb3duOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLWRvd24nXHJcbiAgICB9LFxyXG4gICAgbWF4SG91cnM6IDI0LFxyXG4gICAgZXhwbGljaXRNb2RlOiBmYWxzZVxyXG4gIH07XHJcblxyXG4gICQuZm4udGltZXBpY2tlci5Db25zdHJ1Y3RvciA9IFRpbWVwaWNrZXI7XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKFxyXG4gICAgJ2ZvY3VzLnRpbWVwaWNrZXIuZGF0YS1hcGkgY2xpY2sudGltZXBpY2tlci5kYXRhLWFwaScsXHJcbiAgICAnW2RhdGEtcHJvdmlkZT1cInRpbWVwaWNrZXJcIl0nLFxyXG4gICAgZnVuY3Rpb24oZSl7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgIGlmICgkdGhpcy5kYXRhKCd0aW1lcGlja2VyJykpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAvLyBjb21wb25lbnQgY2xpY2sgcmVxdWlyZXMgdXMgdG8gZXhwbGljaXRseSBzaG93IGl0XHJcbiAgICAgICR0aGlzLnRpbWVwaWNrZXIoKTtcclxuICAgIH1cclxuICApO1xyXG5cclxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTsiXSwiZmlsZSI6ImFzc2V0cy9kYXRlcGlja2VyLmpzIn0=
