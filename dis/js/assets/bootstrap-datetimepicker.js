/*! version : 4.17.47
 =========================================================
 bootstrap-datetimejs
 https://github.com/Eonasdan/bootstrap-datetimepicker
 Copyright (c) 2015 Jonathan Peterson
 =========================================================
 */
/*
 The MIT License (MIT)

 Copyright (c) 2015 Jonathan Peterson

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
/*global define:false */
/*global exports:false */
/*global require:false */
/*global jQuery:false */
/*global moment:false */
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD is used - Register as an anonymous module.
        define(['jquery', 'moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'), require('moment'));
    } else {
        // Neither AMD nor CommonJS used. Use global variables.
        if (typeof jQuery === 'undefined') {
            throw 'bootstrap-datetimepicker requires jQuery to be loaded first';
        }
        if (typeof moment === 'undefined') {
            throw 'bootstrap-datetimepicker requires Moment.js to be loaded first';
        }
        factory(jQuery, moment);
    }
}(function ($, moment) {
    'use strict';
    if (!moment) {
        throw new Error('bootstrap-datetimepicker requires Moment.js to be loaded first');
    }

    var dateTimePicker = function (element, options) {
        var picker = {},
            date,
            viewDate,
            unset = true,
            input,
            component = false,
            widget = false,
            use24Hours,
            minViewModeNumber = 0,
            actualFormat,
            parseFormats,
            currentViewMode,
            datePickerModes = [
                {
                    clsName: 'days',
                    navFnc: 'M',
                    navStep: 1
                },
                {
                    clsName: 'months',
                    navFnc: 'y',
                    navStep: 1
                },
                {
                    clsName: 'years',
                    navFnc: 'y',
                    navStep: 10
                },
                {
                    clsName: 'decades',
                    navFnc: 'y',
                    navStep: 100
                }
            ],
            viewModes = ['days', 'months', 'years', 'decades'],
            verticalModes = ['top', 'bottom', 'auto'],
            horizontalModes = ['left', 'right', 'auto'],
            toolbarPlacements = ['default', 'top', 'bottom'],
            keyMap = {
                'up': 38,
                38: 'up',
                'down': 40,
                40: 'down',
                'left': 37,
                37: 'left',
                'right': 39,
                39: 'right',
                'tab': 9,
                9: 'tab',
                'escape': 27,
                27: 'escape',
                'enter': 13,
                13: 'enter',
                'pageUp': 33,
                33: 'pageUp',
                'pageDown': 34,
                34: 'pageDown',
                'shift': 16,
                16: 'shift',
                'control': 17,
                17: 'control',
                'space': 32,
                32: 'space',
                't': 84,
                84: 't',
                'delete': 46,
                46: 'delete'
            },
            keyState = {},

            /********************************************************************************
             *
             * Private functions
             *
             ********************************************************************************/

            hasTimeZone = function () {
                return moment.tz !== undefined && options.timeZone !== undefined && options.timeZone !== null && options.timeZone !== '';
            },

            getMoment = function (d) {
                var returnMoment;

                if (d === undefined || d === null) {
                    returnMoment = moment(); //TODO should this use format? and locale?
                } else if (moment.isDate(d) || moment.isMoment(d)) {
                    // If the date that is passed in is already a Date() or moment() object,
                    // pass it directly to moment.
                    returnMoment = moment(d);
                } else if (hasTimeZone()) { // There is a string to parse and a default time zone
                    // parse with the tz function which takes a default time zone if it is not in the format string
                    returnMoment = moment.tz(d, parseFormats, options.useStrict, options.timeZone);
                } else {
                    returnMoment = moment(d, parseFormats, options.useStrict);
                }

                if (hasTimeZone()) {
                    returnMoment.tz(options.timeZone);
                }

                return returnMoment;
            },

            isEnabled = function (granularity) {
                if (typeof granularity !== 'string' || granularity.length > 1) {
                    throw new TypeError('isEnabled expects a single character string parameter');
                }
                switch (granularity) {
                    case 'y':
                        return actualFormat.indexOf('Y') !== -1;
                    case 'M':
                        return actualFormat.indexOf('M') !== -1;
                    case 'd':
                        return actualFormat.toLowerCase().indexOf('d') !== -1;
                    case 'h':
                    case 'H':
                        return actualFormat.toLowerCase().indexOf('h') !== -1;
                    case 'm':
                        return actualFormat.indexOf('m') !== -1;
                    case 's':
                        return actualFormat.indexOf('s') !== -1;
                    default:
                        return false;
                }
            },

            hasTime = function () {
                return (isEnabled('h') || isEnabled('m') || isEnabled('s'));
            },

            hasDate = function () {
                return (isEnabled('y') || isEnabled('M') || isEnabled('d'));
            },

            getDatePickerTemplate = function () {
                var headTemplate = $('<thead>')
                        .append($('<tr>')
                            .append($('<th>').addClass('prev').attr('data-action', 'previous')
                                .append($('<span>').addClass(options.icons.previous))
                                )
                            .append($('<th>').addClass('picker-switch').attr('data-action', 'pickerSwitch').attr('colspan', (options.calendarWeeks ? '6' : '5')))
                            .append($('<th>').addClass('next').attr('data-action', 'next')
                                .append($('<span>').addClass(options.icons.next))
                                )
                            ),
                    contTemplate = $('<tbody>')
                        .append($('<tr>')
                            .append($('<td>').attr('colspan', (options.calendarWeeks ? '8' : '7')))
                            );

                return [
                    $('<div>').addClass('datepicker-days')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate)
                            .append($('<tbody>'))
                            ),
                    $('<div>').addClass('datepicker-months')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate.clone())
                            .append(contTemplate.clone())
                            ),
                    $('<div>').addClass('datepicker-years')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate.clone())
                            .append(contTemplate.clone())
                            ),
                    $('<div>').addClass('datepicker-decades')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate.clone())
                            .append(contTemplate.clone())
                            )
                ];
            },

            getTimePickerMainTemplate = function () {
                var topRow = $('<tr>'),
                    middleRow = $('<tr>'),
                    bottomRow = $('<tr>');

                if (isEnabled('h')) {
                    topRow.append($('<td>')
                        .append($('<a>').attr({ href: '#', tabindex: '-1', 'title': options.tooltips.incrementHour }).addClass('btn').attr('data-action', 'incrementHours').append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>')
                        .append($('<span>').addClass('timepicker-hour').attr({ 'data-time-component': 'hours', 'title': options.tooltips.pickHour }).attr('data-action', 'showHours')));
                    bottomRow.append($('<td>')
                        .append($('<a>').attr({ href: '#', tabindex: '-1', 'title': options.tooltips.decrementHour }).addClass('btn').attr('data-action', 'decrementHours').append($('<span>').addClass(options.icons.down))));
                }
                if (isEnabled('m')) {
                    if (isEnabled('h')) {
                        topRow.append($('<td>').addClass('separator'));
                        middleRow.append($('<td>').addClass('separator').html(':'));
                        bottomRow.append($('<td>').addClass('separator'));
                    }
                    topRow.append($('<td>')
                        .append($('<a>').attr({ href: '#', tabindex: '-1', 'title': options.tooltips.incrementMinute }).addClass('btn').attr('data-action', 'incrementMinutes')
                            .append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>')
                        .append($('<span>').addClass('timepicker-minute').attr({ 'data-time-component': 'minutes', 'title': options.tooltips.pickMinute }).attr('data-action', 'showMinutes')));
                    bottomRow.append($('<td>')
                        .append($('<a>').attr({ href: '#', tabindex: '-1', 'title': options.tooltips.decrementMinute }).addClass('btn').attr('data-action', 'decrementMinutes')
                            .append($('<span>').addClass(options.icons.down))));
                }
                if (isEnabled('s')) {
                    if (isEnabled('m')) {
                        topRow.append($('<td>').addClass('separator'));
                        middleRow.append($('<td>').addClass('separator').html(':'));
                        bottomRow.append($('<td>').addClass('separator'));
                    }
                    topRow.append($('<td>')
                        .append($('<a>').attr({ href: '#', tabindex: '-1', 'title': options.tooltips.incrementSecond }).addClass('btn').attr('data-action', 'incrementSeconds')
                            .append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>')
                        .append($('<span>').addClass('timepicker-second').attr({ 'data-time-component': 'seconds', 'title': options.tooltips.pickSecond }).attr('data-action', 'showSeconds')));
                    bottomRow.append($('<td>')
                        .append($('<a>').attr({ href: '#', tabindex: '-1', 'title': options.tooltips.decrementSecond }).addClass('btn').attr('data-action', 'decrementSeconds')
                            .append($('<span>').addClass(options.icons.down))));
                }

                if (!use24Hours) {
                    topRow.append($('<td>').addClass('separator'));
                    middleRow.append($('<td>')
                        .append($('<button>').addClass('btn btn-primary').attr({ 'data-action': 'togglePeriod', tabindex: '-1', 'title': options.tooltips.togglePeriod })));
                    bottomRow.append($('<td>').addClass('separator'));
                }

                return $('<div>').addClass('timepicker-picker')
                    .append($('<table>').addClass('table-condensed')
                        .append([topRow, middleRow, bottomRow]));
            },

            getTimePickerTemplate = function () {
                var hoursView = $('<div>').addClass('timepicker-hours')
                        .append($('<table>').addClass('table-condensed')),
                    minutesView = $('<div>').addClass('timepicker-minutes')
                        .append($('<table>').addClass('table-condensed')),
                    secondsView = $('<div>').addClass('timepicker-seconds')
                        .append($('<table>').addClass('table-condensed')),
                    ret = [getTimePickerMainTemplate()];

                if (isEnabled('h')) {
                    ret.push(hoursView);
                }
                if (isEnabled('m')) {
                    ret.push(minutesView);
                }
                if (isEnabled('s')) {
                    ret.push(secondsView);
                }

                return ret;
            },

            getToolbar = function () {
                var row = [];
                if (options.showTodayButton) {
                    row.push($('<td>').append($('<a>').attr({ 'data-action': 'today', 'title': options.tooltips.today }).append($('<span>').addClass(options.icons.today))));
                }
                if (!options.sideBySide && hasDate() && hasTime()) {
                    row.push($('<td>').append($('<a>').attr({ 'data-action': 'togglePicker', 'title': options.tooltips.selectTime }).append($('<span>').addClass(options.icons.time))));
                }
                if (options.showClear) {
                    row.push($('<td>').append($('<a>').attr({ 'data-action': 'clear', 'title': options.tooltips.clear }).append($('<span>').addClass(options.icons.clear))));
                }
                if (options.showClose) {
                    row.push($('<td>').append($('<a>').attr({ 'data-action': 'close', 'title': options.tooltips.close }).append($('<span>').addClass(options.icons.close))));
                }
                return $('<table>').addClass('table-condensed').append($('<tbody>').append($('<tr>').append(row)));
            },

            getTemplate = function () {
                var template = $('<div>').addClass('bootstrap-datetimepicker-widget dropdown-menu'),
                    dateView = $('<div>').addClass('datepicker').append(getDatePickerTemplate()),
                    timeView = $('<div>').addClass('timepicker').append(getTimePickerTemplate()),
                    content = $('<ul>').addClass('list-unstyled'),
                    toolbar = $('<li>').addClass('picker-switch' + (options.collapse ? ' accordion-toggle' : '')).append(getToolbar());

                if (options.inline) {
                    template.removeClass('dropdown-menu');
                }

                if (use24Hours) {
                    template.addClass('usetwentyfour');
                }

                if (isEnabled('s') && !use24Hours) {
                    template.addClass('wider');
                }

                if (options.sideBySide && hasDate() && hasTime()) {
                    template.addClass('timepicker-sbs');
                    if (options.toolbarPlacement === 'top') {
                        template.append(toolbar);
                    }
                    template.append(
                        $('<div>').addClass('row')
                            .append(dateView.addClass('col-md-6'))
                            .append(timeView.addClass('col-md-6'))
                    );
                    if (options.toolbarPlacement === 'bottom') {
                        template.append(toolbar);
                    }
                    return template;
                }

                if (options.toolbarPlacement === 'top') {
                    content.append(toolbar);
                }
                if (hasDate()) {
                    content.append($('<li>').addClass((options.collapse && hasTime() ? 'collapse in' : '')).append(dateView));
                }
                if (options.toolbarPlacement === 'default') {
                    content.append(toolbar);
                }
                if (hasTime()) {
                    content.append($('<li>').addClass((options.collapse && hasDate() ? 'collapse' : '')).append(timeView));
                }
                if (options.toolbarPlacement === 'bottom') {
                    content.append(toolbar);
                }
                return template.append(content);
            },

            dataToOptions = function () {
                var eData,
                    dataOptions = {};

                if (element.is('input') || options.inline) {
                    eData = element.data();
                } else {
                    eData = element.find('input').data();
                }

                if (eData.dateOptions && eData.dateOptions instanceof Object) {
                    dataOptions = $.extend(true, dataOptions, eData.dateOptions);
                }

                $.each(options, function (key) {
                    var attributeName = 'date' + key.charAt(0).toUpperCase() + key.slice(1);
                    if (eData[attributeName] !== undefined) {
                        dataOptions[key] = eData[attributeName];
                    }
                });
                return dataOptions;
            },

            place = function () {
                var position = (component || element).position(),
                    offset = (component || element).offset(),
                    vertical = options.widgetPositioning.vertical,
                    horizontal = options.widgetPositioning.horizontal,
                    parent;

                if (options.widgetParent) {
                    parent = options.widgetParent.append(widget);
                } else if (element.is('input')) {
                    parent = element.after(widget).parent();
                } else if (options.inline) {
                    parent = element.append(widget);
                    return;
                } else {
                    parent = element;
                    element.children().first().after(widget);
                }

                // Top and bottom logic
                if (vertical === 'auto') {
                    if (offset.top + widget.height() * 1.5 >= $(window).height() + $(window).scrollTop() &&
                        widget.height() + element.outerHeight() < offset.top) {
                        vertical = 'top';
                    } else {
                        vertical = 'bottom';
                    }
                }

                // Left and right logic
                if (horizontal === 'auto') {
                    if (parent.width() < offset.left + widget.outerWidth() / 2 &&
                        offset.left + widget.outerWidth() > $(window).width()) {
                        horizontal = 'right';
                    } else {
                        horizontal = 'left';
                    }
                }

                if (vertical === 'top') {
                    widget.addClass('top').removeClass('bottom');
                } else {
                    widget.addClass('bottom').removeClass('top');
                }

                if (horizontal === 'right') {
                    widget.addClass('pull-right');
                } else {
                    widget.removeClass('pull-right');
                }

                // find the first parent element that has a non-static css positioning
                if (parent.css('position') === 'static') {
                    parent = parent.parents().filter(function () {
                        return $(this).css('position') !== 'static';
                    }).first();
                }

                if (parent.length === 0) {
                    throw new Error('datetimepicker component should be placed within a non-static positioned container');
                }

                widget.css({
                    top: vertical === 'top' ? 'auto' : position.top + element.outerHeight(),
                    bottom: vertical === 'top' ? parent.outerHeight() - (parent === element ? 0 : position.top) : 'auto',
                    left: horizontal === 'left' ? (parent === element ? 0 : position.left) : 'auto',
                    right: horizontal === 'left' ? 'auto' : parent.outerWidth() - element.outerWidth() - (parent === element ? 0 : position.left)
                });
            },

            notifyEvent = function (e) {
                if (e.type === 'dp.change' && ((e.date && e.date.isSame(e.oldDate)) || (!e.date && !e.oldDate))) {
                    return;
                }
                element.trigger(e);
            },

            viewUpdate = function (e) {
                if (e === 'y') {
                    e = 'YYYY';
                }
                notifyEvent({
                    type: 'dp.update',
                    change: e,
                    viewDate: viewDate.clone()
                });
            },

            showMode = function (dir) {
                if (!widget) {
                    return;
                }
                if (dir) {
                    currentViewMode = Math.max(minViewModeNumber, Math.min(3, currentViewMode + dir));
                }
                widget.find('.datepicker > div').hide().filter('.datepicker-' + datePickerModes[currentViewMode].clsName).show();
            },

            fillDow = function () {
                var row = $('<tr>'),
                    currentDate = viewDate.clone().startOf('w').startOf('d');

                if (options.calendarWeeks === true) {
                    row.append($('<th>').addClass('cw').text('#'));
                }

                while (currentDate.isBefore(viewDate.clone().endOf('w'))) {
                    row.append($('<th>').addClass('dow').text(currentDate.format('dd')));
                    currentDate.add(1, 'd');
                }
                widget.find('.datepicker-days thead').append(row);
            },

            isInDisabledDates = function (testDate) {
                return options.disabledDates[testDate.format('YYYY-MM-DD')] === true;
            },

            isInEnabledDates = function (testDate) {
                return options.enabledDates[testDate.format('YYYY-MM-DD')] === true;
            },

            isInDisabledHours = function (testDate) {
                return options.disabledHours[testDate.format('H')] === true;
            },

            isInEnabledHours = function (testDate) {
                return options.enabledHours[testDate.format('H')] === true;
            },

            isValid = function (targetMoment, granularity) {
                if (!targetMoment.isValid()) {
                    return false;
                }
                if (options.disabledDates && granularity === 'd' && isInDisabledDates(targetMoment)) {
                    return false;
                }
                if (options.enabledDates && granularity === 'd' && !isInEnabledDates(targetMoment)) {
                    return false;
                }
                if (options.minDate && targetMoment.isBefore(options.minDate, granularity)) {
                    return false;
                }
                if (options.maxDate && targetMoment.isAfter(options.maxDate, granularity)) {
                    return false;
                }
                if (options.daysOfWeekDisabled && granularity === 'd' && options.daysOfWeekDisabled.indexOf(targetMoment.day()) !== -1) {
                    return false;
                }
                if (options.disabledHours && (granularity === 'h' || granularity === 'm' || granularity === 's') && isInDisabledHours(targetMoment)) {
                    return false;
                }
                if (options.enabledHours && (granularity === 'h' || granularity === 'm' || granularity === 's') && !isInEnabledHours(targetMoment)) {
                    return false;
                }
                if (options.disabledTimeIntervals && (granularity === 'h' || granularity === 'm' || granularity === 's')) {
                    var found = false;
                    $.each(options.disabledTimeIntervals, function () {
                        if (targetMoment.isBetween(this[0], this[1])) {
                            found = true;
                            return false;
                        }
                    });
                    if (found) {
                        return false;
                    }
                }
                return true;
            },

            fillMonths = function () {
                var spans = [],
                    monthsShort = viewDate.clone().startOf('y').startOf('d');
                while (monthsShort.isSame(viewDate, 'y')) {
                    spans.push($('<span>').attr('data-action', 'selectMonth').addClass('month').text(monthsShort.format('MMM')));
                    monthsShort.add(1, 'M');
                }
                widget.find('.datepicker-months td').empty().append(spans);
            },

            updateMonths = function () {
                var monthsView = widget.find('.datepicker-months'),
                    monthsViewHeader = monthsView.find('th'),
                    months = monthsView.find('tbody').find('span');

                monthsViewHeader.eq(0).find('span').attr('title', options.tooltips.prevYear);
                monthsViewHeader.eq(1).attr('title', options.tooltips.selectYear);
                monthsViewHeader.eq(2).find('span').attr('title', options.tooltips.nextYear);

                monthsView.find('.disabled').removeClass('disabled');

                if (!isValid(viewDate.clone().subtract(1, 'y'), 'y')) {
                    monthsViewHeader.eq(0).addClass('disabled');
                }

                monthsViewHeader.eq(1).text(viewDate.year());

                if (!isValid(viewDate.clone().add(1, 'y'), 'y')) {
                    monthsViewHeader.eq(2).addClass('disabled');
                }

                months.removeClass('active');
                if (date.isSame(viewDate, 'y') && !unset) {
                    months.eq(date.month()).addClass('active');
                }

                months.each(function (index) {
                    if (!isValid(viewDate.clone().month(index), 'M')) {
                        $(this).addClass('disabled');
                    }
                });
            },

            updateYears = function () {
                var yearsView = widget.find('.datepicker-years'),
                    yearsViewHeader = yearsView.find('th'),
                    startYear = viewDate.clone().subtract(5, 'y'),
                    endYear = viewDate.clone().add(6, 'y'),
                    html = '';

                yearsViewHeader.eq(0).find('span').attr('title', options.tooltips.prevDecade);
                yearsViewHeader.eq(1).attr('title', options.tooltips.selectDecade);
                yearsViewHeader.eq(2).find('span').attr('title', options.tooltips.nextDecade);

                yearsView.find('.disabled').removeClass('disabled');

                if (options.minDate && options.minDate.isAfter(startYear, 'y')) {
                    yearsViewHeader.eq(0).addClass('disabled');
                }

                yearsViewHeader.eq(1).text(startYear.year() + '-' + endYear.year());

                if (options.maxDate && options.maxDate.isBefore(endYear, 'y')) {
                    yearsViewHeader.eq(2).addClass('disabled');
                }

                while (!startYear.isAfter(endYear, 'y')) {
                    html += '<span data-action="selectYear" class="year' + (startYear.isSame(date, 'y') && !unset ? ' active' : '') + (!isValid(startYear, 'y') ? ' disabled' : '') + '">' + startYear.year() + '</span>';
                    startYear.add(1, 'y');
                }

                yearsView.find('td').html(html);
            },

            updateDecades = function () {
                var decadesView = widget.find('.datepicker-decades'),
                    decadesViewHeader = decadesView.find('th'),
                    startDecade = moment({ y: viewDate.year() - (viewDate.year() % 100) - 1 }),
                    endDecade = startDecade.clone().add(100, 'y'),
                    startedAt = startDecade.clone(),
                    minDateDecade = false,
                    maxDateDecade = false,
                    endDecadeYear,
                    html = '';

                decadesViewHeader.eq(0).find('span').attr('title', options.tooltips.prevCentury);
                decadesViewHeader.eq(2).find('span').attr('title', options.tooltips.nextCentury);

                decadesView.find('.disabled').removeClass('disabled');

                if (startDecade.isSame(moment({ y: 1900 })) || (options.minDate && options.minDate.isAfter(startDecade, 'y'))) {
                    decadesViewHeader.eq(0).addClass('disabled');
                }

                decadesViewHeader.eq(1).text(startDecade.year() + '-' + endDecade.year());

                if (startDecade.isSame(moment({ y: 2000 })) || (options.maxDate && options.maxDate.isBefore(endDecade, 'y'))) {
                    decadesViewHeader.eq(2).addClass('disabled');
                }

                while (!startDecade.isAfter(endDecade, 'y')) {
                    endDecadeYear = startDecade.year() + 12;
                    minDateDecade = options.minDate && options.minDate.isAfter(startDecade, 'y') && options.minDate.year() <= endDecadeYear;
                    maxDateDecade = options.maxDate && options.maxDate.isAfter(startDecade, 'y') && options.maxDate.year() <= endDecadeYear;
                    html += '<span data-action="selectDecade" class="decade' + (date.isAfter(startDecade) && date.year() <= endDecadeYear ? ' active' : '') +
                        (!isValid(startDecade, 'y') && !minDateDecade && !maxDateDecade ? ' disabled' : '') + '" data-selection="' + (startDecade.year() + 6) + '">' + (startDecade.year() + 1) + ' - ' + (startDecade.year() + 12) + '</span>';
                    startDecade.add(12, 'y');
                }
                html += '<span></span><span></span><span></span>'; //push the dangling block over, at least this way it's even

                decadesView.find('td').html(html);
                decadesViewHeader.eq(1).text((startedAt.year() + 1) + '-' + (startDecade.year()));
            },

            fillDate = function () {
                var daysView = widget.find('.datepicker-days'),
                    daysViewHeader = daysView.find('th'),
                    currentDate,
                    html = [],
                    row,
                    clsNames = [],
                    i;

                if (!hasDate()) {
                    return;
                }

                daysViewHeader.eq(0).find('span').attr('title', options.tooltips.prevMonth);
                daysViewHeader.eq(1).attr('title', options.tooltips.selectMonth);
                daysViewHeader.eq(2).find('span').attr('title', options.tooltips.nextMonth);

                daysView.find('.disabled').removeClass('disabled');
                daysViewHeader.eq(1).text(viewDate.format(options.dayViewHeaderFormat));

                if (!isValid(viewDate.clone().subtract(1, 'M'), 'M')) {
                    daysViewHeader.eq(0).addClass('disabled');
                }
                if (!isValid(viewDate.clone().add(1, 'M'), 'M')) {
                    daysViewHeader.eq(2).addClass('disabled');
                }

                currentDate = viewDate.clone().startOf('M').startOf('w').startOf('d');

                for (i = 0; i < 42; i++) { //always display 42 days (should show 6 weeks)
                    if (currentDate.weekday() === 0) {
                        row = $('<tr>');
                        if (options.calendarWeeks) {
                            row.append('<td class="cw">' + currentDate.week() + '</td>');
                        }
                        html.push(row);
                    }
                    clsNames = ['day'];
                    if (currentDate.isBefore(viewDate, 'M')) {
                        clsNames.push('old');
                    }
                    if (currentDate.isAfter(viewDate, 'M')) {
                        clsNames.push('new');
                    }
                    if (currentDate.isSame(date, 'd') && !unset) {
                        clsNames.push('active');
                    }
                    if (!isValid(currentDate, 'd')) {
                        clsNames.push('disabled');
                    }
                    if (currentDate.isSame(getMoment(), 'd')) {
                        clsNames.push('today');
                    }
                    if (currentDate.day() === 0 || currentDate.day() === 6) {
                        clsNames.push('weekend');
                    }
                    notifyEvent({
                        type: 'dp.classify',
                        date: currentDate,
                        classNames: clsNames
                    });
                    row.append('<td data-action="selectDay" data-day="' + currentDate.format('L') + '" class="' + clsNames.join(' ') + '">' + currentDate.date() + '</td>');
                    currentDate.add(1, 'd');
                }

                daysView.find('tbody').empty().append(html);

                updateMonths();

                updateYears();

                updateDecades();
            },

            fillHours = function () {
                var table = widget.find('.timepicker-hours table'),
                    currentHour = viewDate.clone().startOf('d'),
                    html = [],
                    row = $('<tr>');

                if (viewDate.hour() > 11 && !use24Hours) {
                    currentHour.hour(12);
                }
                while (currentHour.isSame(viewDate, 'd') && (use24Hours || (viewDate.hour() < 12 && currentHour.hour() < 12) || viewDate.hour() > 11)) {
                    if (currentHour.hour() % 4 === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    row.append('<td data-action="selectHour" class="hour' + (!isValid(currentHour, 'h') ? ' disabled' : '') + '">' + currentHour.format(use24Hours ? 'HH' : 'hh') + '</td>');
                    currentHour.add(1, 'h');
                }
                table.empty().append(html);
            },

            fillMinutes = function () {
                var table = widget.find('.timepicker-minutes table'),
                    currentMinute = viewDate.clone().startOf('h'),
                    html = [],
                    row = $('<tr>'),
                    step = options.stepping === 1 ? 5 : options.stepping;

                while (viewDate.isSame(currentMinute, 'h')) {
                    if (currentMinute.minute() % (step * 4) === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    row.append('<td data-action="selectMinute" class="minute' + (!isValid(currentMinute, 'm') ? ' disabled' : '') + '">' + currentMinute.format('mm') + '</td>');
                    currentMinute.add(step, 'm');
                }
                table.empty().append(html);
            },

            fillSeconds = function () {
                var table = widget.find('.timepicker-seconds table'),
                    currentSecond = viewDate.clone().startOf('m'),
                    html = [],
                    row = $('<tr>');

                while (viewDate.isSame(currentSecond, 'm')) {
                    if (currentSecond.second() % 20 === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    row.append('<td data-action="selectSecond" class="second' + (!isValid(currentSecond, 's') ? ' disabled' : '') + '">' + currentSecond.format('ss') + '</td>');
                    currentSecond.add(5, 's');
                }

                table.empty().append(html);
            },

            fillTime = function () {
                var toggle, newDate, timeComponents = widget.find('.timepicker span[data-time-component]');

                if (!use24Hours) {
                    toggle = widget.find('.timepicker [data-action=togglePeriod]');
                    newDate = date.clone().add((date.hours() >= 12) ? -12 : 12, 'h');

                    toggle.text(date.format('A'));

                    if (isValid(newDate, 'h')) {
                        toggle.removeClass('disabled');
                    } else {
                        toggle.addClass('disabled');
                    }
                }
                timeComponents.filter('[data-time-component=hours]').text(date.format(use24Hours ? 'HH' : 'hh'));
                timeComponents.filter('[data-time-component=minutes]').text(date.format('mm'));
                timeComponents.filter('[data-time-component=seconds]').text(date.format('ss'));

                fillHours();
                fillMinutes();
                fillSeconds();
            },

            update = function () {
                if (!widget) {
                    return;
                }
                fillDate();
                fillTime();
            },

            setValue = function (targetMoment) {
                var oldDate = unset ? null : date;

                // case of calling setValue(null or false)
                if (!targetMoment) {
                    unset = true;
                    input.val('');
                    element.data('date', '');
                    notifyEvent({
                        type: 'dp.change',
                        date: false,
                        oldDate: oldDate
                    });
                    update();
                    return;
                }

                targetMoment = targetMoment.clone().locale(options.locale);

                if (hasTimeZone()) {
                    targetMoment.tz(options.timeZone);
                }

                if (options.stepping !== 1) {
                    targetMoment.minutes((Math.round(targetMoment.minutes() / options.stepping) * options.stepping)).seconds(0);

                    while (options.minDate && targetMoment.isBefore(options.minDate)) {
                        targetMoment.add(options.stepping, 'minutes');
                    }
                }

                if (isValid(targetMoment)) {
                    date = targetMoment;
                    viewDate = date.clone();
                    input.val(date.format(actualFormat));
                    element.data('date', date.format(actualFormat));
                    unset = false;
                    update();
                    notifyEvent({
                        type: 'dp.change',
                        date: date.clone(),
                        oldDate: oldDate
                    });
                } else {
                    if (!options.keepInvalid) {
                        input.val(unset ? '' : date.format(actualFormat));
                    } else {
                        notifyEvent({
                            type: 'dp.change',
                            date: targetMoment,
                            oldDate: oldDate
                        });
                    }
                    notifyEvent({
                        type: 'dp.error',
                        date: targetMoment,
                        oldDate: oldDate
                    });
                }
            },

            /**
             * Hides the widget. Possibly will emit dp.hide
             */
            hide = function () {
                var transitioning = false;
                if (!widget) {
                    return picker;
                }
                // Ignore event if in the middle of a picker transition
                widget.find('.collapse').each(function () {
                    var collapseData = $(this).data('collapse');
                    if (collapseData && collapseData.transitioning) {
                        transitioning = true;
                        return false;
                    }
                    return true;
                });
                if (transitioning) {
                    return picker;
                }
                if (component && component.hasClass('btn')) {
                    component.toggleClass('active');
                }
                widget.hide();

                $(window).off('resize', place);
                widget.off('click', '[data-action]');
                widget.off('mousedown', false);

                widget.remove();
                widget = false;

                notifyEvent({
                    type: 'dp.hide',
                    date: date.clone()
                });

                input.blur();

                viewDate = date.clone();

                return picker;
            },

            clear = function () {
                setValue(null);
            },

            parseInputDate = function (inputDate) {
                if (options.parseInputDate === undefined) {
                    if (!moment.isMoment(inputDate) || inputDate instanceof Date) {
                        inputDate = getMoment(inputDate);
                    }
                } else {
                    inputDate = options.parseInputDate(inputDate);
                }
                //inputDate.locale(options.locale);
                return inputDate;
            },

            /********************************************************************************
             *
             * Widget UI interaction functions
             *
             ********************************************************************************/
            actions = {
                next: function () {
                    var navFnc = datePickerModes[currentViewMode].navFnc;
                    viewDate.add(datePickerModes[currentViewMode].navStep, navFnc);
                    fillDate();
                    viewUpdate(navFnc);
                },

                previous: function () {
                    var navFnc = datePickerModes[currentViewMode].navFnc;
                    viewDate.subtract(datePickerModes[currentViewMode].navStep, navFnc);
                    fillDate();
                    viewUpdate(navFnc);
                },

                pickerSwitch: function () {
                    showMode(1);
                },

                selectMonth: function (e) {
                    var month = $(e.target).closest('tbody').find('span').index($(e.target));
                    viewDate.month(month);
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()).month(viewDate.month()));
                        if (!options.inline) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                    viewUpdate('M');
                },

                selectYear: function (e) {
                    var year = parseInt($(e.target).text(), 10) || 0;
                    viewDate.year(year);
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()));
                        if (!options.inline) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                    viewUpdate('YYYY');
                },

                selectDecade: function (e) {
                    var year = parseInt($(e.target).data('selection'), 10) || 0;
                    viewDate.year(year);
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()));
                        if (!options.inline) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                    viewUpdate('YYYY');
                },

                selectDay: function (e) {
                    var day = viewDate.clone();
                    if ($(e.target).is('.old')) {
                        day.subtract(1, 'M');
                    }
                    if ($(e.target).is('.new')) {
                        day.add(1, 'M');
                    }
                    setValue(day.date(parseInt($(e.target).text(), 10)));
                    if (!hasTime() && !options.keepOpen && !options.inline) {
                        hide();
                    }
                },

                incrementHours: function () {
                    var newDate = date.clone().add(1, 'h');
                    if (isValid(newDate, 'h')) {
                        setValue(newDate);
                    }
                },

                incrementMinutes: function () {
                    var newDate = date.clone().add(options.stepping, 'm');
                    if (isValid(newDate, 'm')) {
                        setValue(newDate);
                    }
                },

                incrementSeconds: function () {
                    var newDate = date.clone().add(1, 's');
                    if (isValid(newDate, 's')) {
                        setValue(newDate);
                    }
                },

                decrementHours: function () {
                    var newDate = date.clone().subtract(1, 'h');
                    if (isValid(newDate, 'h')) {
                        setValue(newDate);
                    }
                },

                decrementMinutes: function () {
                    var newDate = date.clone().subtract(options.stepping, 'm');
                    if (isValid(newDate, 'm')) {
                        setValue(newDate);
                    }
                },

                decrementSeconds: function () {
                    var newDate = date.clone().subtract(1, 's');
                    if (isValid(newDate, 's')) {
                        setValue(newDate);
                    }
                },

                togglePeriod: function () {
                    setValue(date.clone().add((date.hours() >= 12) ? -12 : 12, 'h'));
                },

                togglePicker: function (e) {
                    var $this = $(e.target),
                        $parent = $this.closest('ul'),
                        expanded = $parent.find('.in'),
                        closed = $parent.find('.collapse:not(.in)'),
                        collapseData;

                    if (expanded && expanded.length) {
                        collapseData = expanded.data('collapse');
                        if (collapseData && collapseData.transitioning) {
                            return;
                        }
                        if (expanded.collapse) { // if collapse plugin is available through bootstrap.js then use it
                            expanded.collapse('hide');
                            closed.collapse('show');
                        } else { // otherwise just toggle in class on the two views
                            expanded.removeClass('in');
                            closed.addClass('in');
                        }
                        if ($this.is('span')) {
                            $this.toggleClass(options.icons.time + ' ' + options.icons.date);
                        } else {
                            $this.find('span').toggleClass(options.icons.time + ' ' + options.icons.date);
                        }

                        // NOTE: uncomment if toggled state will be restored in show()
                        //if (component) {
                        //    component.find('span').toggleClass(options.icons.time + ' ' + options.icons.date);
                        //}
                    }
                },

                showPicker: function () {
                    widget.find('.timepicker > div:not(.timepicker-picker)').hide();
                    widget.find('.timepicker .timepicker-picker').show();
                },

                showHours: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-hours').show();
                },

                showMinutes: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-minutes').show();
                },

                showSeconds: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-seconds').show();
                },

                selectHour: function (e) {
                    var hour = parseInt($(e.target).text(), 10);

                    if (!use24Hours) {
                        if (date.hours() >= 12) {
                            if (hour !== 12) {
                                hour += 12;
                            }
                        } else {
                            if (hour === 12) {
                                hour = 0;
                            }
                        }
                    }
                    setValue(date.clone().hours(hour));
                    actions.showPicker.call(picker);
                },

                selectMinute: function (e) {
                    setValue(date.clone().minutes(parseInt($(e.target).text(), 10)));
                    actions.showPicker.call(picker);
                },

                selectSecond: function (e) {
                    setValue(date.clone().seconds(parseInt($(e.target).text(), 10)));
                    actions.showPicker.call(picker);
                },

                clear: clear,

                today: function () {
                    var todaysDate = getMoment();
                    if (isValid(todaysDate, 'd')) {
                        setValue(todaysDate);
                    }
                },

                close: hide
            },

            doAction = function (e) {
                if ($(e.currentTarget).is('.disabled')) {
                    return false;
                }
                actions[$(e.currentTarget).data('action')].apply(picker, arguments);
                return false;
            },

            /**
             * Shows the widget. Possibly will emit dp.show and dp.change
             */
            show = function () {
                var currentMoment,
                    useCurrentGranularity = {
                        'year': function (m) {
                            return m.month(0).date(1).hours(0).seconds(0).minutes(0);
                        },
                        'month': function (m) {
                            return m.date(1).hours(0).seconds(0).minutes(0);
                        },
                        'day': function (m) {
                            return m.hours(0).seconds(0).minutes(0);
                        },
                        'hour': function (m) {
                            return m.seconds(0).minutes(0);
                        },
                        'minute': function (m) {
                            return m.seconds(0);
                        }
                    };

                if (input.prop('disabled') || (!options.ignoreReadonly && input.prop('readonly')) || widget) {
                    return picker;
                }
                if (input.val() !== undefined && input.val().trim().length !== 0) {
                    setValue(parseInputDate(input.val().trim()));
                } else if (unset && options.useCurrent && (options.inline || (input.is('input') && input.val().trim().length === 0))) {
                    currentMoment = getMoment();
                    if (typeof options.useCurrent === 'string') {
                        currentMoment = useCurrentGranularity[options.useCurrent](currentMoment);
                    }
                    setValue(currentMoment);
                }
                widget = getTemplate();

                fillDow();
                fillMonths();

                widget.find('.timepicker-hours').hide();
                widget.find('.timepicker-minutes').hide();
                widget.find('.timepicker-seconds').hide();

                update();
                showMode();

                $(window).on('resize', place);
                widget.on('click', '[data-action]', doAction); // this handles clicks on the widget
                widget.on('mousedown', false);

                if (component && component.hasClass('btn')) {
                    component.toggleClass('active');
                }
                place();
                widget.show();
                if (options.focusOnShow && !input.is(':focus')) {
                    input.focus();
                }

                notifyEvent({
                    type: 'dp.show'
                });
                return picker;
            },

            /**
             * Shows or hides the widget
             */
            toggle = function () {
                return (widget ? hide() : show());
            },

            keydown = function (e) {
                var handler = null,
                    index,
                    index2,
                    pressedKeys = [],
                    pressedModifiers = {},
                    currentKey = e.which,
                    keyBindKeys,
                    allModifiersPressed,
                    pressed = 'p';

                keyState[currentKey] = pressed;

                for (index in keyState) {
                    if (keyState.hasOwnProperty(index) && keyState[index] === pressed) {
                        pressedKeys.push(index);
                        if (parseInt(index, 10) !== currentKey) {
                            pressedModifiers[index] = true;
                        }
                    }
                }

                for (index in options.keyBinds) {
                    if (options.keyBinds.hasOwnProperty(index) && typeof (options.keyBinds[index]) === 'function') {
                        keyBindKeys = index.split(' ');
                        if (keyBindKeys.length === pressedKeys.length && keyMap[currentKey] === keyBindKeys[keyBindKeys.length - 1]) {
                            allModifiersPressed = true;
                            for (index2 = keyBindKeys.length - 2; index2 >= 0; index2--) {
                                if (!(keyMap[keyBindKeys[index2]] in pressedModifiers)) {
                                    allModifiersPressed = false;
                                    break;
                                }
                            }
                            if (allModifiersPressed) {
                                handler = options.keyBinds[index];
                                break;
                            }
                        }
                    }
                }

                if (handler) {
                    handler.call(picker, widget);
                    e.stopPropagation();
                    e.preventDefault();
                }
            },

            keyup = function (e) {
                keyState[e.which] = 'r';
                e.stopPropagation();
                e.preventDefault();
            },

            change = function (e) {
                var val = $(e.target).val().trim(),
                    parsedDate = val ? parseInputDate(val) : null;
                setValue(parsedDate);
                e.stopImmediatePropagation();
                return false;
            },

            attachDatePickerElementEvents = function () {
                input.on({
                    'change': change,
                    'blur': options.debug ? '' : hide,
                    'keydown': keydown,
                    'keyup': keyup,
                    'focus': options.allowInputToggle ? show : ''
                });

                if (element.is('input')) {
                    input.on({
                        'focus': show
                    });
                } else if (component) {
                    component.on('click', toggle);
                    component.on('mousedown', false);
                }
            },

            detachDatePickerElementEvents = function () {
                input.off({
                    'change': change,
                    'blur': blur,
                    'keydown': keydown,
                    'keyup': keyup,
                    'focus': options.allowInputToggle ? hide : ''
                });

                if (element.is('input')) {
                    input.off({
                        'focus': show
                    });
                } else if (component) {
                    component.off('click', toggle);
                    component.off('mousedown', false);
                }
            },

            indexGivenDates = function (givenDatesArray) {
                // Store given enabledDates and disabledDates as keys.
                // This way we can check their existence in O(1) time instead of looping through whole array.
                // (for example: options.enabledDates['2014-02-27'] === true)
                var givenDatesIndexed = {};
                $.each(givenDatesArray, function () {
                    var dDate = parseInputDate(this);
                    if (dDate.isValid()) {
                        givenDatesIndexed[dDate.format('YYYY-MM-DD')] = true;
                    }
                });
                return (Object.keys(givenDatesIndexed).length) ? givenDatesIndexed : false;
            },

            indexGivenHours = function (givenHoursArray) {
                // Store given enabledHours and disabledHours as keys.
                // This way we can check their existence in O(1) time instead of looping through whole array.
                // (for example: options.enabledHours['2014-02-27'] === true)
                var givenHoursIndexed = {};
                $.each(givenHoursArray, function () {
                    givenHoursIndexed[this] = true;
                });
                return (Object.keys(givenHoursIndexed).length) ? givenHoursIndexed : false;
            },

            initFormatting = function () {
                var format = options.format || 'L LT';

                actualFormat = format.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (formatInput) {
                    var newinput = date.localeData().longDateFormat(formatInput) || formatInput;
                    return newinput.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (formatInput2) { //temp fix for #740
                        return date.localeData().longDateFormat(formatInput2) || formatInput2;
                    });
                });


                parseFormats = options.extraFormats ? options.extraFormats.slice() : [];
                if (parseFormats.indexOf(format) < 0 && parseFormats.indexOf(actualFormat) < 0) {
                    parseFormats.push(actualFormat);
                }

                use24Hours = (actualFormat.toLowerCase().indexOf('a') < 1 && actualFormat.replace(/\[.*?\]/g, '').indexOf('h') < 1);

                if (isEnabled('y')) {
                    minViewModeNumber = 2;
                }
                if (isEnabled('M')) {
                    minViewModeNumber = 1;
                }
                if (isEnabled('d')) {
                    minViewModeNumber = 0;
                }

                currentViewMode = Math.max(minViewModeNumber, currentViewMode);

                if (!unset) {
                    setValue(date);
                }
            };

        /********************************************************************************
         *
         * Public API functions
         * =====================
         *
         * Important: Do not expose direct references to private objects or the options
         * object to the outer world. Always return a clone when returning values or make
         * a clone when setting a private variable.
         *
         ********************************************************************************/
        picker.destroy = function () {
            ///<summary>Destroys the widget and removes all attached event listeners</summary>
            hide();
            detachDatePickerElementEvents();
            element.removeData('DateTimePicker');
            element.removeData('date');
        };

        picker.toggle = toggle;

        picker.show = show;

        picker.hide = hide;

        picker.disable = function () {
            ///<summary>Disables the input element, the component is attached to, by adding a disabled="true" attribute to it.
            ///If the widget was visible before that call it is hidden. Possibly emits dp.hide</summary>
            hide();
            if (component && component.hasClass('btn')) {
                component.addClass('disabled');
            }
            input.prop('disabled', true);
            return picker;
        };

        picker.enable = function () {
            ///<summary>Enables the input element, the component is attached to, by removing disabled attribute from it.</summary>
            if (component && component.hasClass('btn')) {
                component.removeClass('disabled');
            }
            input.prop('disabled', false);
            return picker;
        };

        picker.ignoreReadonly = function (ignoreReadonly) {
            if (arguments.length === 0) {
                return options.ignoreReadonly;
            }
            if (typeof ignoreReadonly !== 'boolean') {
                throw new TypeError('ignoreReadonly () expects a boolean parameter');
            }
            options.ignoreReadonly = ignoreReadonly;
            return picker;
        };

        picker.options = function (newOptions) {
            if (arguments.length === 0) {
                return $.extend(true, {}, options);
            }

            if (!(newOptions instanceof Object)) {
                throw new TypeError('options() options parameter should be an object');
            }
            $.extend(true, options, newOptions);
            $.each(options, function (key, value) {
                if (picker[key] !== undefined) {
                    picker[key](value);
                } else {
                    throw new TypeError('option ' + key + ' is not recognized!');
                }
            });
            return picker;
        };

        picker.date = function (newDate) {
            ///<signature helpKeyword="$.fn.datetimepicker.date">
            ///<summary>Returns the component's model current date, a moment object or null if not set.</summary>
            ///<returns type="Moment">date.clone()</returns>
            ///</signature>
            ///<signature>
            ///<summary>Sets the components model current moment to it. Passing a null value unsets the components model current moment. Parsing of the newDate parameter is made using moment library with the options.format and options.useStrict components configuration.</summary>
            ///<param name="newDate" locid="$.fn.datetimepicker.date_p:newDate">Takes string, Date, moment, null parameter.</param>
            ///</signature>
            if (arguments.length === 0) {
                if (unset) {
                    return null;
                }
                return date.clone();
            }

            if (newDate !== null && typeof newDate !== 'string' && !moment.isMoment(newDate) && !(newDate instanceof Date)) {
                throw new TypeError('date() parameter must be one of [null, string, moment or Date]');
            }

            setValue(newDate === null ? null : parseInputDate(newDate));
            return picker;
        };

        picker.format = function (newFormat) {
            ///<summary>test su</summary>
            ///<param name="newFormat">info about para</param>
            ///<returns type="string|boolean">returns foo</returns>
            if (arguments.length === 0) {
                return options.format;
            }

            if ((typeof newFormat !== 'string') && ((typeof newFormat !== 'boolean') || (newFormat !== false))) {
                throw new TypeError('format() expects a string or boolean:false parameter ' + newFormat);
            }

            options.format = newFormat;
            if (actualFormat) {
                initFormatting(); // reinit formatting
            }
            return picker;
        };

        picker.timeZone = function (newZone) {
            if (arguments.length === 0) {
                return options.timeZone;
            }

            if (typeof newZone !== 'string') {
                throw new TypeError('newZone() expects a string parameter');
            }

            options.timeZone = newZone;

            return picker;
        };

        picker.dayViewHeaderFormat = function (newFormat) {
            if (arguments.length === 0) {
                return options.dayViewHeaderFormat;
            }

            if (typeof newFormat !== 'string') {
                throw new TypeError('dayViewHeaderFormat() expects a string parameter');
            }

            options.dayViewHeaderFormat = newFormat;
            return picker;
        };

        picker.extraFormats = function (formats) {
            if (arguments.length === 0) {
                return options.extraFormats;
            }

            if (formats !== false && !(formats instanceof Array)) {
                throw new TypeError('extraFormats() expects an array or false parameter');
            }

            options.extraFormats = formats;
            if (parseFormats) {
                initFormatting(); // reinit formatting
            }
            return picker;
        };

        picker.disabledDates = function (dates) {
            ///<signature helpKeyword="$.fn.datetimepicker.disabledDates">
            ///<summary>Returns an array with the currently set disabled dates on the component.</summary>
            ///<returns type="array">options.disabledDates</returns>
            ///</signature>
            ///<signature>
            ///<summary>Setting this takes precedence over options.minDate, options.maxDate configuration. Also calling this function removes the configuration of
            ///options.enabledDates if such exist.</summary>
            ///<param name="dates" locid="$.fn.datetimepicker.disabledDates_p:dates">Takes an [ string or Date or moment ] of values and allows the user to select only from those days.</param>
            ///</signature>
            if (arguments.length === 0) {
                return (options.disabledDates ? $.extend({}, options.disabledDates) : options.disabledDates);
            }

            if (!dates) {
                options.disabledDates = false;
                update();
                return picker;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError('disabledDates() expects an array parameter');
            }
            options.disabledDates = indexGivenDates(dates);
            options.enabledDates = false;
            update();
            return picker;
        };

        picker.enabledDates = function (dates) {
            ///<signature helpKeyword="$.fn.datetimepicker.enabledDates">
            ///<summary>Returns an array with the currently set enabled dates on the component.</summary>
            ///<returns type="array">options.enabledDates</returns>
            ///</signature>
            ///<signature>
            ///<summary>Setting this takes precedence over options.minDate, options.maxDate configuration. Also calling this function removes the configuration of options.disabledDates if such exist.</summary>
            ///<param name="dates" locid="$.fn.datetimepicker.enabledDates_p:dates">Takes an [ string or Date or moment ] of values and allows the user to select only from those days.</param>
            ///</signature>
            if (arguments.length === 0) {
                return (options.enabledDates ? $.extend({}, options.enabledDates) : options.enabledDates);
            }

            if (!dates) {
                options.enabledDates = false;
                update();
                return picker;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError('enabledDates() expects an array parameter');
            }
            options.enabledDates = indexGivenDates(dates);
            options.disabledDates = false;
            update();
            return picker;
        };

        picker.daysOfWeekDisabled = function (daysOfWeekDisabled) {
            if (arguments.length === 0) {
                return options.daysOfWeekDisabled.splice(0);
            }

            if ((typeof daysOfWeekDisabled === 'boolean') && !daysOfWeekDisabled) {
                options.daysOfWeekDisabled = false;
                update();
                return picker;
            }

            if (!(daysOfWeekDisabled instanceof Array)) {
                throw new TypeError('daysOfWeekDisabled() expects an array parameter');
            }
            options.daysOfWeekDisabled = daysOfWeekDisabled.reduce(function (previousValue, currentValue) {
                currentValue = parseInt(currentValue, 10);
                if (currentValue > 6 || currentValue < 0 || isNaN(currentValue)) {
                    return previousValue;
                }
                if (previousValue.indexOf(currentValue) === -1) {
                    previousValue.push(currentValue);
                }
                return previousValue;
            }, []).sort();
            if (options.useCurrent && !options.keepInvalid) {
                var tries = 0;
                while (!isValid(date, 'd')) {
                    date.add(1, 'd');
                    if (tries === 31) {
                        throw 'Tried 31 times to find a valid date';
                    }
                    tries++;
                }
                setValue(date);
            }
            update();
            return picker;
        };

        picker.maxDate = function (maxDate) {
            if (arguments.length === 0) {
                return options.maxDate ? options.maxDate.clone() : options.maxDate;
            }

            if ((typeof maxDate === 'boolean') && maxDate === false) {
                options.maxDate = false;
                update();
                return picker;
            }

            if (typeof maxDate === 'string') {
                if (maxDate === 'now' || maxDate === 'moment') {
                    maxDate = getMoment();
                }
            }

            var parsedDate = parseInputDate(maxDate);

            if (!parsedDate.isValid()) {
                throw new TypeError('maxDate() Could not parse date parameter: ' + maxDate);
            }
            if (options.minDate && parsedDate.isBefore(options.minDate)) {
                throw new TypeError('maxDate() date parameter is before options.minDate: ' + parsedDate.format(actualFormat));
            }
            options.maxDate = parsedDate;
            if (options.useCurrent && !options.keepInvalid && date.isAfter(maxDate)) {
                setValue(options.maxDate);
            }
            if (viewDate.isAfter(parsedDate)) {
                viewDate = parsedDate.clone().subtract(options.stepping, 'm');
            }
            update();
            return picker;
        };

        picker.minDate = function (minDate) {
            if (arguments.length === 0) {
                return options.minDate ? options.minDate.clone() : options.minDate;
            }

            if ((typeof minDate === 'boolean') && minDate === false) {
                options.minDate = false;
                update();
                return picker;
            }

            if (typeof minDate === 'string') {
                if (minDate === 'now' || minDate === 'moment') {
                    minDate = getMoment();
                }
            }

            var parsedDate = parseInputDate(minDate);

            if (!parsedDate.isValid()) {
                throw new TypeError('minDate() Could not parse date parameter: ' + minDate);
            }
            if (options.maxDate && parsedDate.isAfter(options.maxDate)) {
                throw new TypeError('minDate() date parameter is after options.maxDate: ' + parsedDate.format(actualFormat));
            }
            options.minDate = parsedDate;
            if (options.useCurrent && !options.keepInvalid && date.isBefore(minDate)) {
                setValue(options.minDate);
            }
            if (viewDate.isBefore(parsedDate)) {
                viewDate = parsedDate.clone().add(options.stepping, 'm');
            }
            update();
            return picker;
        };

        picker.defaultDate = function (defaultDate) {
            ///<signature helpKeyword="$.fn.datetimepicker.defaultDate">
            ///<summary>Returns a moment with the options.defaultDate option configuration or false if not set</summary>
            ///<returns type="Moment">date.clone()</returns>
            ///</signature>
            ///<signature>
            ///<summary>Will set the picker's inital date. If a boolean:false value is passed the options.defaultDate parameter is cleared.</summary>
            ///<param name="defaultDate" locid="$.fn.datetimepicker.defaultDate_p:defaultDate">Takes a string, Date, moment, boolean:false</param>
            ///</signature>
            if (arguments.length === 0) {
                return options.defaultDate ? options.defaultDate.clone() : options.defaultDate;
            }
            if (!defaultDate) {
                options.defaultDate = false;
                return picker;
            }

            if (typeof defaultDate === 'string') {
                if (defaultDate === 'now' || defaultDate === 'moment') {
                    defaultDate = getMoment();
                } else {
                    defaultDate = getMoment(defaultDate);
                }
            }

            var parsedDate = parseInputDate(defaultDate);
            if (!parsedDate.isValid()) {
                throw new TypeError('defaultDate() Could not parse date parameter: ' + defaultDate);
            }
            if (!isValid(parsedDate)) {
                throw new TypeError('defaultDate() date passed is invalid according to component setup validations');
            }

            options.defaultDate = parsedDate;

            if ((options.defaultDate && options.inline) || input.val().trim() === '') {
                setValue(options.defaultDate);
            }
            return picker;
        };

        picker.locale = function (locale) {
            if (arguments.length === 0) {
                return options.locale;
            }

            if (!moment.localeData(locale)) {
                throw new TypeError('locale() locale ' + locale + ' is not loaded from moment locales!');
            }

            options.locale = locale;
            date.locale(options.locale);
            viewDate.locale(options.locale);

            if (actualFormat) {
                initFormatting(); // reinit formatting
            }
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.stepping = function (stepping) {
            if (arguments.length === 0) {
                return options.stepping;
            }

            stepping = parseInt(stepping, 10);
            if (isNaN(stepping) || stepping < 1) {
                stepping = 1;
            }
            options.stepping = stepping;
            return picker;
        };

        picker.useCurrent = function (useCurrent) {
            var useCurrentOptions = ['year', 'month', 'day', 'hour', 'minute'];
            if (arguments.length === 0) {
                return options.useCurrent;
            }

            if ((typeof useCurrent !== 'boolean') && (typeof useCurrent !== 'string')) {
                throw new TypeError('useCurrent() expects a boolean or string parameter');
            }
            if (typeof useCurrent === 'string' && useCurrentOptions.indexOf(useCurrent.toLowerCase()) === -1) {
                throw new TypeError('useCurrent() expects a string parameter of ' + useCurrentOptions.join(', '));
            }
            options.useCurrent = useCurrent;
            return picker;
        };

        picker.collapse = function (collapse) {
            if (arguments.length === 0) {
                return options.collapse;
            }

            if (typeof collapse !== 'boolean') {
                throw new TypeError('collapse() expects a boolean parameter');
            }
            if (options.collapse === collapse) {
                return picker;
            }
            options.collapse = collapse;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.icons = function (icons) {
            if (arguments.length === 0) {
                return $.extend({}, options.icons);
            }

            if (!(icons instanceof Object)) {
                throw new TypeError('icons() expects parameter to be an Object');
            }
            $.extend(options.icons, icons);
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.tooltips = function (tooltips) {
            if (arguments.length === 0) {
                return $.extend({}, options.tooltips);
            }

            if (!(tooltips instanceof Object)) {
                throw new TypeError('tooltips() expects parameter to be an Object');
            }
            $.extend(options.tooltips, tooltips);
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.useStrict = function (useStrict) {
            if (arguments.length === 0) {
                return options.useStrict;
            }

            if (typeof useStrict !== 'boolean') {
                throw new TypeError('useStrict() expects a boolean parameter');
            }
            options.useStrict = useStrict;
            return picker;
        };

        picker.sideBySide = function (sideBySide) {
            if (arguments.length === 0) {
                return options.sideBySide;
            }

            if (typeof sideBySide !== 'boolean') {
                throw new TypeError('sideBySide() expects a boolean parameter');
            }
            options.sideBySide = sideBySide;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.viewMode = function (viewMode) {
            if (arguments.length === 0) {
                return options.viewMode;
            }

            if (typeof viewMode !== 'string') {
                throw new TypeError('viewMode() expects a string parameter');
            }

            if (viewModes.indexOf(viewMode) === -1) {
                throw new TypeError('viewMode() parameter must be one of (' + viewModes.join(', ') + ') value');
            }

            options.viewMode = viewMode;
            currentViewMode = Math.max(viewModes.indexOf(viewMode), minViewModeNumber);

            showMode();
            return picker;
        };

        picker.toolbarPlacement = function (toolbarPlacement) {
            if (arguments.length === 0) {
                return options.toolbarPlacement;
            }

            if (typeof toolbarPlacement !== 'string') {
                throw new TypeError('toolbarPlacement() expects a string parameter');
            }
            if (toolbarPlacements.indexOf(toolbarPlacement) === -1) {
                throw new TypeError('toolbarPlacement() parameter must be one of (' + toolbarPlacements.join(', ') + ') value');
            }
            options.toolbarPlacement = toolbarPlacement;

            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.widgetPositioning = function (widgetPositioning) {
            if (arguments.length === 0) {
                return $.extend({}, options.widgetPositioning);
            }

            if (({}).toString.call(widgetPositioning) !== '[object Object]') {
                throw new TypeError('widgetPositioning() expects an object variable');
            }
            if (widgetPositioning.horizontal) {
                if (typeof widgetPositioning.horizontal !== 'string') {
                    throw new TypeError('widgetPositioning() horizontal variable must be a string');
                }
                widgetPositioning.horizontal = widgetPositioning.horizontal.toLowerCase();
                if (horizontalModes.indexOf(widgetPositioning.horizontal) === -1) {
                    throw new TypeError('widgetPositioning() expects horizontal parameter to be one of (' + horizontalModes.join(', ') + ')');
                }
                options.widgetPositioning.horizontal = widgetPositioning.horizontal;
            }
            if (widgetPositioning.vertical) {
                if (typeof widgetPositioning.vertical !== 'string') {
                    throw new TypeError('widgetPositioning() vertical variable must be a string');
                }
                widgetPositioning.vertical = widgetPositioning.vertical.toLowerCase();
                if (verticalModes.indexOf(widgetPositioning.vertical) === -1) {
                    throw new TypeError('widgetPositioning() expects vertical parameter to be one of (' + verticalModes.join(', ') + ')');
                }
                options.widgetPositioning.vertical = widgetPositioning.vertical;
            }
            update();
            return picker;
        };

        picker.calendarWeeks = function (calendarWeeks) {
            if (arguments.length === 0) {
                return options.calendarWeeks;
            }

            if (typeof calendarWeeks !== 'boolean') {
                throw new TypeError('calendarWeeks() expects parameter to be a boolean value');
            }

            options.calendarWeeks = calendarWeeks;
            update();
            return picker;
        };

        picker.showTodayButton = function (showTodayButton) {
            if (arguments.length === 0) {
                return options.showTodayButton;
            }

            if (typeof showTodayButton !== 'boolean') {
                throw new TypeError('showTodayButton() expects a boolean parameter');
            }

            options.showTodayButton = showTodayButton;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.showClear = function (showClear) {
            if (arguments.length === 0) {
                return options.showClear;
            }

            if (typeof showClear !== 'boolean') {
                throw new TypeError('showClear() expects a boolean parameter');
            }

            options.showClear = showClear;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.widgetParent = function (widgetParent) {
            if (arguments.length === 0) {
                return options.widgetParent;
            }

            if (typeof widgetParent === 'string') {
                widgetParent = $(widgetParent);
            }

            if (widgetParent !== null && (typeof widgetParent !== 'string' && !(widgetParent instanceof $))) {
                throw new TypeError('widgetParent() expects a string or a jQuery object parameter');
            }

            options.widgetParent = widgetParent;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.keepOpen = function (keepOpen) {
            if (arguments.length === 0) {
                return options.keepOpen;
            }

            if (typeof keepOpen !== 'boolean') {
                throw new TypeError('keepOpen() expects a boolean parameter');
            }

            options.keepOpen = keepOpen;
            return picker;
        };

        picker.focusOnShow = function (focusOnShow) {
            if (arguments.length === 0) {
                return options.focusOnShow;
            }

            if (typeof focusOnShow !== 'boolean') {
                throw new TypeError('focusOnShow() expects a boolean parameter');
            }

            options.focusOnShow = focusOnShow;
            return picker;
        };

        picker.inline = function (inline) {
            if (arguments.length === 0) {
                return options.inline;
            }

            if (typeof inline !== 'boolean') {
                throw new TypeError('inline() expects a boolean parameter');
            }

            options.inline = inline;
            return picker;
        };

        picker.clear = function () {
            clear();
            return picker;
        };

        picker.keyBinds = function (keyBinds) {
            if (arguments.length === 0) {
                return options.keyBinds;
            }

            options.keyBinds = keyBinds;
            return picker;
        };

        picker.getMoment = function (d) {
            return getMoment(d);
        };

        picker.debug = function (debug) {
            if (typeof debug !== 'boolean') {
                throw new TypeError('debug() expects a boolean parameter');
            }

            options.debug = debug;
            return picker;
        };

        picker.allowInputToggle = function (allowInputToggle) {
            if (arguments.length === 0) {
                return options.allowInputToggle;
            }

            if (typeof allowInputToggle !== 'boolean') {
                throw new TypeError('allowInputToggle() expects a boolean parameter');
            }

            options.allowInputToggle = allowInputToggle;
            return picker;
        };

        picker.showClose = function (showClose) {
            if (arguments.length === 0) {
                return options.showClose;
            }

            if (typeof showClose !== 'boolean') {
                throw new TypeError('showClose() expects a boolean parameter');
            }

            options.showClose = showClose;
            return picker;
        };

        picker.keepInvalid = function (keepInvalid) {
            if (arguments.length === 0) {
                return options.keepInvalid;
            }

            if (typeof keepInvalid !== 'boolean') {
                throw new TypeError('keepInvalid() expects a boolean parameter');
            }
            options.keepInvalid = keepInvalid;
            return picker;
        };

        picker.datepickerInput = function (datepickerInput) {
            if (arguments.length === 0) {
                return options.datepickerInput;
            }

            if (typeof datepickerInput !== 'string') {
                throw new TypeError('datepickerInput() expects a string parameter');
            }

            options.datepickerInput = datepickerInput;
            return picker;
        };

        picker.parseInputDate = function (parseInputDate) {
            if (arguments.length === 0) {
                return options.parseInputDate;
            }

            if (typeof parseInputDate !== 'function') {
                throw new TypeError('parseInputDate() sholud be as function');
            }

            options.parseInputDate = parseInputDate;

            return picker;
        };

        picker.disabledTimeIntervals = function (disabledTimeIntervals) {
            ///<signature helpKeyword="$.fn.datetimepicker.disabledTimeIntervals">
            ///<summary>Returns an array with the currently set disabled dates on the component.</summary>
            ///<returns type="array">options.disabledTimeIntervals</returns>
            ///</signature>
            ///<signature>
            ///<summary>Setting this takes precedence over options.minDate, options.maxDate configuration. Also calling this function removes the configuration of
            ///options.enabledDates if such exist.</summary>
            ///<param name="dates" locid="$.fn.datetimepicker.disabledTimeIntervals_p:dates">Takes an [ string or Date or moment ] of values and allows the user to select only from those days.</param>
            ///</signature>
            if (arguments.length === 0) {
                return (options.disabledTimeIntervals ? $.extend({}, options.disabledTimeIntervals) : options.disabledTimeIntervals);
            }

            if (!disabledTimeIntervals) {
                options.disabledTimeIntervals = false;
                update();
                return picker;
            }
            if (!(disabledTimeIntervals instanceof Array)) {
                throw new TypeError('disabledTimeIntervals() expects an array parameter');
            }
            options.disabledTimeIntervals = disabledTimeIntervals;
            update();
            return picker;
        };

        picker.disabledHours = function (hours) {
            ///<signature helpKeyword="$.fn.datetimepicker.disabledHours">
            ///<summary>Returns an array with the currently set disabled hours on the component.</summary>
            ///<returns type="array">options.disabledHours</returns>
            ///</signature>
            ///<signature>
            ///<summary>Setting this takes precedence over options.minDate, options.maxDate configuration. Also calling this function removes the configuration of
            ///options.enabledHours if such exist.</summary>
            ///<param name="hours" locid="$.fn.datetimepicker.disabledHours_p:hours">Takes an [ int ] of values and disallows the user to select only from those hours.</param>
            ///</signature>
            if (arguments.length === 0) {
                return (options.disabledHours ? $.extend({}, options.disabledHours) : options.disabledHours);
            }

            if (!hours) {
                options.disabledHours = false;
                update();
                return picker;
            }
            if (!(hours instanceof Array)) {
                throw new TypeError('disabledHours() expects an array parameter');
            }
            options.disabledHours = indexGivenHours(hours);
            options.enabledHours = false;
            if (options.useCurrent && !options.keepInvalid) {
                var tries = 0;
                while (!isValid(date, 'h')) {
                    date.add(1, 'h');
                    if (tries === 24) {
                        throw 'Tried 24 times to find a valid date';
                    }
                    tries++;
                }
                setValue(date);
            }
            update();
            return picker;
        };

        picker.enabledHours = function (hours) {
            ///<signature helpKeyword="$.fn.datetimepicker.enabledHours">
            ///<summary>Returns an array with the currently set enabled hours on the component.</summary>
            ///<returns type="array">options.enabledHours</returns>
            ///</signature>
            ///<signature>
            ///<summary>Setting this takes precedence over options.minDate, options.maxDate configuration. Also calling this function removes the configuration of options.disabledHours if such exist.</summary>
            ///<param name="hours" locid="$.fn.datetimepicker.enabledHours_p:hours">Takes an [ int ] of values and allows the user to select only from those hours.</param>
            ///</signature>
            if (arguments.length === 0) {
                return (options.enabledHours ? $.extend({}, options.enabledHours) : options.enabledHours);
            }

            if (!hours) {
                options.enabledHours = false;
                update();
                return picker;
            }
            if (!(hours instanceof Array)) {
                throw new TypeError('enabledHours() expects an array parameter');
            }
            options.enabledHours = indexGivenHours(hours);
            options.disabledHours = false;
            if (options.useCurrent && !options.keepInvalid) {
                var tries = 0;
                while (!isValid(date, 'h')) {
                    date.add(1, 'h');
                    if (tries === 24) {
                        throw 'Tried 24 times to find a valid date';
                    }
                    tries++;
                }
                setValue(date);
            }
            update();
            return picker;
        };
        /**
         * Returns the component's model current viewDate, a moment object or null if not set. Passing a null value unsets the components model current moment. Parsing of the newDate parameter is made using moment library with the options.format and options.useStrict components configuration.
         * @param {Takes string, viewDate, moment, null parameter.} newDate
         * @returns {viewDate.clone()}
         */
        picker.viewDate = function (newDate) {
            if (arguments.length === 0) {
                return viewDate.clone();
            }

            if (!newDate) {
                viewDate = date.clone();
                return picker;
            }

            if (typeof newDate !== 'string' && !moment.isMoment(newDate) && !(newDate instanceof Date)) {
                throw new TypeError('viewDate() parameter must be one of [string, moment or Date]');
            }

            viewDate = parseInputDate(newDate);
            viewUpdate();
            return picker;
        };

        // initializing element and component attributes
        if (element.is('input')) {
            input = element;
        } else {
            input = element.find(options.datepickerInput);
            if (input.length === 0) {
                input = element.find('input');
            } else if (!input.is('input')) {
                throw new Error('CSS class "' + options.datepickerInput + '" cannot be applied to non input element');
            }
        }

        if (element.hasClass('input-group')) {
            // in case there is more then one 'input-group-addon' Issue #48
            if (element.find('.datepickerbutton').length === 0) {
                component = element.find('.input-group-addon');
            } else {
                component = element.find('.datepickerbutton');
            }
        }

        if (!options.inline && !input.is('input')) {
            throw new Error('Could not initialize DateTimePicker without an input element');
        }

        // Set defaults for date here now instead of in var declaration
        date = getMoment();
        viewDate = date.clone();

        $.extend(true, options, dataToOptions());

        picker.options(options);

        initFormatting();

        attachDatePickerElementEvents();

        if (input.prop('disabled')) {
            picker.disable();
        }
        if (input.is('input') && input.val().trim().length !== 0) {
            setValue(parseInputDate(input.val().trim()));
        }
        else if (options.defaultDate && input.attr('placeholder') === undefined) {
            setValue(options.defaultDate);
        }
        if (options.inline) {
            show();
        }
        return picker;
    };

    /********************************************************************************
     *
     * jQuery plugin constructor and defaults object
     *
     ********************************************************************************/

    /**
    * See (http://jquery.com/).
    * @name jQuery
    * @class
    * See the jQuery Library  (http://jquery.com/) for full details.  This just
    * documents the function and classes that are added to jQuery by this plug-in.
    */
    /**
     * See (http://jquery.com/)
     * @name fn
     * @class
     * See the jQuery Library  (http://jquery.com/) for full details.  This just
     * documents the function and classes that are added to jQuery by this plug-in.
     * @memberOf jQuery
     */
    /**
     * Show comments
     * @class datetimepicker
     * @memberOf jQuery.fn
     */
    $.fn.datetimepicker = function (options) {
        options = options || {};

        var args = Array.prototype.slice.call(arguments, 1),
            isInstance = true,
            thisMethods = ['destroy', 'hide', 'show', 'toggle'],
            returnValue;

        if (typeof options === 'object') {
            return this.each(function () {
                var $this = $(this),
                    _options;
                if (!$this.data('DateTimePicker')) {
                    // create a private copy of the defaults object
                    _options = $.extend(true, {}, $.fn.datetimepicker.defaults, options);
                    $this.data('DateTimePicker', dateTimePicker($this, _options));
                }
            });
        } else if (typeof options === 'string') {
            this.each(function () {
                var $this = $(this),
                    instance = $this.data('DateTimePicker');
                if (!instance) {
                    throw new Error('bootstrap-datetimepicker("' + options + '") method was called on an element that is not using DateTimePicker');
                }

                returnValue = instance[options].apply(instance, args);
                isInstance = returnValue === instance;
            });

            if (isInstance || $.inArray(options, thisMethods) > -1) {
                return this;
            }

            return returnValue;
        }

        throw new TypeError('Invalid arguments for DateTimePicker: ' + options);
    };

    $.fn.datetimepicker.defaults = {
        timeZone: '',
        format: false,
        dayViewHeaderFormat: 'MMMM YYYY',
        extraFormats: false,
        stepping: 1,
        minDate: false,
        maxDate: false,
        useCurrent: true,
        collapse: true,
        locale: moment.locale(),
        defaultDate: false,
        disabledDates: false,
        enabledDates: false,
        icons: {
            time: 'glyphicon glyphicon-time',
            date: 'glyphicon glyphicon-calendar',
            up: 'glyphicon glyphicon-chevron-up',
            down: 'glyphicon glyphicon-chevron-down',
            previous: 'glyphicon glyphicon-chevron-left',
            next: 'glyphicon glyphicon-chevron-right',
            today: 'glyphicon glyphicon-screenshot',
            clear: 'glyphicon glyphicon-trash',
            close: 'glyphicon glyphicon-remove'
        },
        tooltips: {
            today: 'Go to today',
            clear: 'Clear selection',
            close: 'Close the picker',
            selectMonth: 'Select Month',
            prevMonth: 'Previous Month',
            nextMonth: 'Next Month',
            selectYear: 'Select Year',
            prevYear: 'Previous Year',
            nextYear: 'Next Year',
            selectDecade: 'Select Decade',
            prevDecade: 'Previous Decade',
            nextDecade: 'Next Decade',
            prevCentury: 'Previous Century',
            nextCentury: 'Next Century',
            pickHour: 'Pick Hour',
            incrementHour: 'Increment Hour',
            decrementHour: 'Decrement Hour',
            pickMinute: 'Pick Minute',
            incrementMinute: 'Increment Minute',
            decrementMinute: 'Decrement Minute',
            pickSecond: 'Pick Second',
            incrementSecond: 'Increment Second',
            decrementSecond: 'Decrement Second',
            togglePeriod: 'Toggle Period',
            selectTime: 'Select Time'
        },
        useStrict: false,
        sideBySide: false,
        daysOfWeekDisabled: false,
        calendarWeeks: false,
        viewMode: 'days',
        toolbarPlacement: 'default',
        showTodayButton: false,
        showClear: false,
        showClose: false,
        widgetPositioning: {
            horizontal: 'auto',
            vertical: 'auto'
        },
        widgetParent: null,
        ignoreReadonly: false,
        keepOpen: false,
        focusOnShow: true,
        inline: false,
        keepInvalid: false,
        datepickerInput: '.datepickerinput',
        keyBinds: {
            up: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(7, 'd'));
                } else {
                    this.date(d.clone().add(this.stepping(), 'm'));
                }
            },
            down: function (widget) {
                if (!widget) {
                    this.show();
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(7, 'd'));
                } else {
                    this.date(d.clone().subtract(this.stepping(), 'm'));
                }
            },
            'control up': function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'y'));
                } else {
                    this.date(d.clone().add(1, 'h'));
                }
            },
            'control down': function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'y'));
                } else {
                    this.date(d.clone().subtract(1, 'h'));
                }
            },
            left: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'd'));
                }
            },
            right: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'd'));
                }
            },
            pageUp: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'M'));
                }
            },
            pageDown: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'M'));
                }
            },
            enter: function () {
                this.hide();
            },
            escape: function () {
                this.hide();
            },
            //tab: function (widget) { //this break the flow of the form. disabling for now
            //    var toggle = widget.find('.picker-switch a[data-action="togglePicker"]');
            //    if(toggle.length > 0) toggle.click();
            //},
            'control space': function (widget) {
                if (!widget) {
                    return;
                }
                if (widget.find('.timepicker').is(':visible')) {
                    widget.find('.btn[data-action="togglePeriod"]').click();
                }
            },
            t: function () {
                this.date(this.getMoment());
            },
            'delete': function () {
                this.clear();
            }
        },
        debug: false,
        allowInputToggle: false,
        disabledTimeIntervals: false,
        disabledHours: false,
        enabledHours: false,
        viewDate: false
    };

    return $.fn.datetimepicker;
}));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhc3NldHMvYm9vdHN0cmFwLWRhdGV0aW1lcGlja2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISB2ZXJzaW9uIDogNC4xNy40N1xyXG4gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiBib290c3RyYXAtZGF0ZXRpbWVqc1xyXG4gaHR0cHM6Ly9naXRodWIuY29tL0VvbmFzZGFuL2Jvb3RzdHJhcC1kYXRldGltZXBpY2tlclxyXG4gQ29weXJpZ2h0IChjKSAyMDE1IEpvbmF0aGFuIFBldGVyc29uXHJcbiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICovXHJcbi8qXHJcbiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuXHJcbiBDb3B5cmlnaHQgKGMpIDIwMTUgSm9uYXRoYW4gUGV0ZXJzb25cclxuXHJcbiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcblxyXG4gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG4gVEhFIFNPRlRXQVJFLlxyXG4gKi9cclxuLypnbG9iYWwgZGVmaW5lOmZhbHNlICovXHJcbi8qZ2xvYmFsIGV4cG9ydHM6ZmFsc2UgKi9cclxuLypnbG9iYWwgcmVxdWlyZTpmYWxzZSAqL1xyXG4vKmdsb2JhbCBqUXVlcnk6ZmFsc2UgKi9cclxuLypnbG9iYWwgbW9tZW50OmZhbHNlICovXHJcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgICAgIC8vIEFNRCBpcyB1c2VkIC0gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cclxuICAgICAgICBkZWZpbmUoWydqcXVlcnknLCAnbW9tZW50J10sIGZhY3RvcnkpO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JyksIHJlcXVpcmUoJ21vbWVudCcpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gTmVpdGhlciBBTUQgbm9yIENvbW1vbkpTIHVzZWQuIFVzZSBnbG9iYWwgdmFyaWFibGVzLlxyXG4gICAgICAgIGlmICh0eXBlb2YgalF1ZXJ5ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICB0aHJvdyAnYm9vdHN0cmFwLWRhdGV0aW1lcGlja2VyIHJlcXVpcmVzIGpRdWVyeSB0byBiZSBsb2FkZWQgZmlyc3QnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG1vbWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgdGhyb3cgJ2Jvb3RzdHJhcC1kYXRldGltZXBpY2tlciByZXF1aXJlcyBNb21lbnQuanMgdG8gYmUgbG9hZGVkIGZpcnN0JztcclxuICAgICAgICB9XHJcbiAgICAgICAgZmFjdG9yeShqUXVlcnksIG1vbWVudCk7XHJcbiAgICB9XHJcbn0oZnVuY3Rpb24gKCQsIG1vbWVudCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgaWYgKCFtb21lbnQpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jvb3RzdHJhcC1kYXRldGltZXBpY2tlciByZXF1aXJlcyBNb21lbnQuanMgdG8gYmUgbG9hZGVkIGZpcnN0Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRhdGVUaW1lUGlja2VyID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgICAgICB2YXIgcGlja2VyID0ge30sXHJcbiAgICAgICAgICAgIGRhdGUsXHJcbiAgICAgICAgICAgIHZpZXdEYXRlLFxyXG4gICAgICAgICAgICB1bnNldCA9IHRydWUsXHJcbiAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICBjb21wb25lbnQgPSBmYWxzZSxcclxuICAgICAgICAgICAgd2lkZ2V0ID0gZmFsc2UsXHJcbiAgICAgICAgICAgIHVzZTI0SG91cnMsXHJcbiAgICAgICAgICAgIG1pblZpZXdNb2RlTnVtYmVyID0gMCxcclxuICAgICAgICAgICAgYWN0dWFsRm9ybWF0LFxyXG4gICAgICAgICAgICBwYXJzZUZvcm1hdHMsXHJcbiAgICAgICAgICAgIGN1cnJlbnRWaWV3TW9kZSxcclxuICAgICAgICAgICAgZGF0ZVBpY2tlck1vZGVzID0gW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsc05hbWU6ICdkYXlzJyxcclxuICAgICAgICAgICAgICAgICAgICBuYXZGbmM6ICdNJyxcclxuICAgICAgICAgICAgICAgICAgICBuYXZTdGVwOiAxXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsc05hbWU6ICdtb250aHMnLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hdkZuYzogJ3knLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hdlN0ZXA6IDFcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xzTmFtZTogJ3llYXJzJyxcclxuICAgICAgICAgICAgICAgICAgICBuYXZGbmM6ICd5JyxcclxuICAgICAgICAgICAgICAgICAgICBuYXZTdGVwOiAxMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjbHNOYW1lOiAnZGVjYWRlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgbmF2Rm5jOiAneScsXHJcbiAgICAgICAgICAgICAgICAgICAgbmF2U3RlcDogMTAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIHZpZXdNb2RlcyA9IFsnZGF5cycsICdtb250aHMnLCAneWVhcnMnLCAnZGVjYWRlcyddLFxyXG4gICAgICAgICAgICB2ZXJ0aWNhbE1vZGVzID0gWyd0b3AnLCAnYm90dG9tJywgJ2F1dG8nXSxcclxuICAgICAgICAgICAgaG9yaXpvbnRhbE1vZGVzID0gWydsZWZ0JywgJ3JpZ2h0JywgJ2F1dG8nXSxcclxuICAgICAgICAgICAgdG9vbGJhclBsYWNlbWVudHMgPSBbJ2RlZmF1bHQnLCAndG9wJywgJ2JvdHRvbSddLFxyXG4gICAgICAgICAgICBrZXlNYXAgPSB7XHJcbiAgICAgICAgICAgICAgICAndXAnOiAzOCxcclxuICAgICAgICAgICAgICAgIDM4OiAndXAnLFxyXG4gICAgICAgICAgICAgICAgJ2Rvd24nOiA0MCxcclxuICAgICAgICAgICAgICAgIDQwOiAnZG93bicsXHJcbiAgICAgICAgICAgICAgICAnbGVmdCc6IDM3LFxyXG4gICAgICAgICAgICAgICAgMzc6ICdsZWZ0JyxcclxuICAgICAgICAgICAgICAgICdyaWdodCc6IDM5LFxyXG4gICAgICAgICAgICAgICAgMzk6ICdyaWdodCcsXHJcbiAgICAgICAgICAgICAgICAndGFiJzogOSxcclxuICAgICAgICAgICAgICAgIDk6ICd0YWInLFxyXG4gICAgICAgICAgICAgICAgJ2VzY2FwZSc6IDI3LFxyXG4gICAgICAgICAgICAgICAgMjc6ICdlc2NhcGUnLFxyXG4gICAgICAgICAgICAgICAgJ2VudGVyJzogMTMsXHJcbiAgICAgICAgICAgICAgICAxMzogJ2VudGVyJyxcclxuICAgICAgICAgICAgICAgICdwYWdlVXAnOiAzMyxcclxuICAgICAgICAgICAgICAgIDMzOiAncGFnZVVwJyxcclxuICAgICAgICAgICAgICAgICdwYWdlRG93bic6IDM0LFxyXG4gICAgICAgICAgICAgICAgMzQ6ICdwYWdlRG93bicsXHJcbiAgICAgICAgICAgICAgICAnc2hpZnQnOiAxNixcclxuICAgICAgICAgICAgICAgIDE2OiAnc2hpZnQnLFxyXG4gICAgICAgICAgICAgICAgJ2NvbnRyb2wnOiAxNyxcclxuICAgICAgICAgICAgICAgIDE3OiAnY29udHJvbCcsXHJcbiAgICAgICAgICAgICAgICAnc3BhY2UnOiAzMixcclxuICAgICAgICAgICAgICAgIDMyOiAnc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgJ3QnOiA4NCxcclxuICAgICAgICAgICAgICAgIDg0OiAndCcsXHJcbiAgICAgICAgICAgICAgICAnZGVsZXRlJzogNDYsXHJcbiAgICAgICAgICAgICAgICA0NjogJ2RlbGV0ZSdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAga2V5U3RhdGUgPSB7fSxcclxuXHJcbiAgICAgICAgICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgKiBQcml2YXRlIGZ1bmN0aW9uc1xyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gICAgICAgICAgICBoYXNUaW1lWm9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBtb21lbnQudHogIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLnRpbWVab25lICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy50aW1lWm9uZSAhPT0gbnVsbCAmJiBvcHRpb25zLnRpbWVab25lICE9PSAnJztcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGdldE1vbWVudCA9IGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmV0dXJuTW9tZW50O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkID09PSB1bmRlZmluZWQgfHwgZCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybk1vbWVudCA9IG1vbWVudCgpOyAvL1RPRE8gc2hvdWxkIHRoaXMgdXNlIGZvcm1hdD8gYW5kIGxvY2FsZT9cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobW9tZW50LmlzRGF0ZShkKSB8fCBtb21lbnQuaXNNb21lbnQoZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgZGF0ZSB0aGF0IGlzIHBhc3NlZCBpbiBpcyBhbHJlYWR5IGEgRGF0ZSgpIG9yIG1vbWVudCgpIG9iamVjdCxcclxuICAgICAgICAgICAgICAgICAgICAvLyBwYXNzIGl0IGRpcmVjdGx5IHRvIG1vbWVudC5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5Nb21lbnQgPSBtb21lbnQoZCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGhhc1RpbWVab25lKCkpIHsgLy8gVGhlcmUgaXMgYSBzdHJpbmcgdG8gcGFyc2UgYW5kIGEgZGVmYXVsdCB0aW1lIHpvbmVcclxuICAgICAgICAgICAgICAgICAgICAvLyBwYXJzZSB3aXRoIHRoZSB0eiBmdW5jdGlvbiB3aGljaCB0YWtlcyBhIGRlZmF1bHQgdGltZSB6b25lIGlmIGl0IGlzIG5vdCBpbiB0aGUgZm9ybWF0IHN0cmluZ1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybk1vbWVudCA9IG1vbWVudC50eihkLCBwYXJzZUZvcm1hdHMsIG9wdGlvbnMudXNlU3RyaWN0LCBvcHRpb25zLnRpbWVab25lKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuTW9tZW50ID0gbW9tZW50KGQsIHBhcnNlRm9ybWF0cywgb3B0aW9ucy51c2VTdHJpY3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChoYXNUaW1lWm9uZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuTW9tZW50LnR6KG9wdGlvbnMudGltZVpvbmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByZXR1cm5Nb21lbnQ7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpc0VuYWJsZWQgPSBmdW5jdGlvbiAoZ3JhbnVsYXJpdHkpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZ3JhbnVsYXJpdHkgIT09ICdzdHJpbmcnIHx8IGdyYW51bGFyaXR5Lmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpc0VuYWJsZWQgZXhwZWN0cyBhIHNpbmdsZSBjaGFyYWN0ZXIgc3RyaW5nIHBhcmFtZXRlcicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChncmFudWxhcml0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3knOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWN0dWFsRm9ybWF0LmluZGV4T2YoJ1knKSAhPT0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnTSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhY3R1YWxGb3JtYXQuaW5kZXhPZignTScpICE9PSAtMTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdkJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFjdHVhbEZvcm1hdC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2QnKSAhPT0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaCc6XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnSCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhY3R1YWxGb3JtYXQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdoJykgIT09IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWN0dWFsRm9ybWF0LmluZGV4T2YoJ20nKSAhPT0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhY3R1YWxGb3JtYXQuaW5kZXhPZigncycpICE9PSAtMTtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBoYXNUaW1lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChpc0VuYWJsZWQoJ2gnKSB8fCBpc0VuYWJsZWQoJ20nKSB8fCBpc0VuYWJsZWQoJ3MnKSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBoYXNEYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChpc0VuYWJsZWQoJ3knKSB8fCBpc0VuYWJsZWQoJ00nKSB8fCBpc0VuYWJsZWQoJ2QnKSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBnZXREYXRlUGlja2VyVGVtcGxhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaGVhZFRlbXBsYXRlID0gJCgnPHRoZWFkPicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJCgnPHRyPicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCQoJzx0aD4nKS5hZGRDbGFzcygncHJldicpLmF0dHIoJ2RhdGEtYWN0aW9uJywgJ3ByZXZpb3VzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCQoJzxzcGFuPicpLmFkZENsYXNzKG9wdGlvbnMuaWNvbnMucHJldmlvdXMpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJCgnPHRoPicpLmFkZENsYXNzKCdwaWNrZXItc3dpdGNoJykuYXR0cignZGF0YS1hY3Rpb24nLCAncGlja2VyU3dpdGNoJykuYXR0cignY29sc3BhbicsIChvcHRpb25zLmNhbGVuZGFyV2Vla3MgPyAnNicgOiAnNScpKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJCgnPHRoPicpLmFkZENsYXNzKCduZXh0JykuYXR0cignZGF0YS1hY3Rpb24nLCAnbmV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgkKCc8c3Bhbj4nKS5hZGRDbGFzcyhvcHRpb25zLmljb25zLm5leHQpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgY29udFRlbXBsYXRlID0gJCgnPHRib2R5PicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJCgnPHRyPicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCQoJzx0ZD4nKS5hdHRyKCdjb2xzcGFuJywgKG9wdGlvbnMuY2FsZW5kYXJXZWVrcyA/ICc4JyA6ICc3JykpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgICQoJzxkaXY+JykuYWRkQ2xhc3MoJ2RhdGVwaWNrZXItZGF5cycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJCgnPHRhYmxlPicpLmFkZENsYXNzKCd0YWJsZS1jb25kZW5zZWQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChoZWFkVGVtcGxhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCQoJzx0Ym9keT4nKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnPGRpdj4nKS5hZGRDbGFzcygnZGF0ZXBpY2tlci1tb250aHMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCQoJzx0YWJsZT4nKS5hZGRDbGFzcygndGFibGUtY29uZGVuc2VkJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoaGVhZFRlbXBsYXRlLmNsb25lKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKGNvbnRUZW1wbGF0ZS5jbG9uZSgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICAkKCc8ZGl2PicpLmFkZENsYXNzKCdkYXRlcGlja2VyLXllYXJzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgkKCc8dGFibGU+JykuYWRkQ2xhc3MoJ3RhYmxlLWNvbmRlbnNlZCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKGhlYWRUZW1wbGF0ZS5jbG9uZSgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChjb250VGVtcGxhdGUuY2xvbmUoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnPGRpdj4nKS5hZGRDbGFzcygnZGF0ZXBpY2tlci1kZWNhZGVzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgkKCc8dGFibGU+JykuYWRkQ2xhc3MoJ3RhYmxlLWNvbmRlbnNlZCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKGhlYWRUZW1wbGF0ZS5jbG9uZSgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChjb250VGVtcGxhdGUuY2xvbmUoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBnZXRUaW1lUGlja2VyTWFpblRlbXBsYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRvcFJvdyA9ICQoJzx0cj4nKSxcclxuICAgICAgICAgICAgICAgICAgICBtaWRkbGVSb3cgPSAkKCc8dHI+JyksXHJcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tUm93ID0gJCgnPHRyPicpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc0VuYWJsZWQoJ2gnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcFJvdy5hcHBlbmQoJCgnPHRkPicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJCgnPGE+JykuYXR0cih7IGhyZWY6ICcjJywgdGFiaW5kZXg6ICctMScsICd0aXRsZSc6IG9wdGlvbnMudG9vbHRpcHMuaW5jcmVtZW50SG91ciB9KS5hZGRDbGFzcygnYnRuJykuYXR0cignZGF0YS1hY3Rpb24nLCAnaW5jcmVtZW50SG91cnMnKS5hcHBlbmQoJCgnPHNwYW4+JykuYWRkQ2xhc3Mob3B0aW9ucy5pY29ucy51cCkpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWlkZGxlUm93LmFwcGVuZCgkKCc8dGQ+JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgkKCc8c3Bhbj4nKS5hZGRDbGFzcygndGltZXBpY2tlci1ob3VyJykuYXR0cih7ICdkYXRhLXRpbWUtY29tcG9uZW50JzogJ2hvdXJzJywgJ3RpdGxlJzogb3B0aW9ucy50b29sdGlwcy5waWNrSG91ciB9KS5hdHRyKCdkYXRhLWFjdGlvbicsICdzaG93SG91cnMnKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbVJvdy5hcHBlbmQoJCgnPHRkPicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJCgnPGE+JykuYXR0cih7IGhyZWY6ICcjJywgdGFiaW5kZXg6ICctMScsICd0aXRsZSc6IG9wdGlvbnMudG9vbHRpcHMuZGVjcmVtZW50SG91ciB9KS5hZGRDbGFzcygnYnRuJykuYXR0cignZGF0YS1hY3Rpb24nLCAnZGVjcmVtZW50SG91cnMnKS5hcHBlbmQoJCgnPHNwYW4+JykuYWRkQ2xhc3Mob3B0aW9ucy5pY29ucy5kb3duKSkpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpc0VuYWJsZWQoJ20nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0VuYWJsZWQoJ2gnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3BSb3cuYXBwZW5kKCQoJzx0ZD4nKS5hZGRDbGFzcygnc2VwYXJhdG9yJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaWRkbGVSb3cuYXBwZW5kKCQoJzx0ZD4nKS5hZGRDbGFzcygnc2VwYXJhdG9yJykuaHRtbCgnOicpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tUm93LmFwcGVuZCgkKCc8dGQ+JykuYWRkQ2xhc3MoJ3NlcGFyYXRvcicpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wUm93LmFwcGVuZCgkKCc8dGQ+JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgkKCc8YT4nKS5hdHRyKHsgaHJlZjogJyMnLCB0YWJpbmRleDogJy0xJywgJ3RpdGxlJzogb3B0aW9ucy50b29sdGlwcy5pbmNyZW1lbnRNaW51dGUgfSkuYWRkQ2xhc3MoJ2J0bicpLmF0dHIoJ2RhdGEtYWN0aW9uJywgJ2luY3JlbWVudE1pbnV0ZXMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgkKCc8c3Bhbj4nKS5hZGRDbGFzcyhvcHRpb25zLmljb25zLnVwKSkpKTtcclxuICAgICAgICAgICAgICAgICAgICBtaWRkbGVSb3cuYXBwZW5kKCQoJzx0ZD4nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCQoJzxzcGFuPicpLmFkZENsYXNzKCd0aW1lcGlja2VyLW1pbnV0ZScpLmF0dHIoeyAnZGF0YS10aW1lLWNvbXBvbmVudCc6ICdtaW51dGVzJywgJ3RpdGxlJzogb3B0aW9ucy50b29sdGlwcy5waWNrTWludXRlIH0pLmF0dHIoJ2RhdGEtYWN0aW9uJywgJ3Nob3dNaW51dGVzJykpKTtcclxuICAgICAgICAgICAgICAgICAgICBib3R0b21Sb3cuYXBwZW5kKCQoJzx0ZD4nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCQoJzxhPicpLmF0dHIoeyBocmVmOiAnIycsIHRhYmluZGV4OiAnLTEnLCAndGl0bGUnOiBvcHRpb25zLnRvb2x0aXBzLmRlY3JlbWVudE1pbnV0ZSB9KS5hZGRDbGFzcygnYnRuJykuYXR0cignZGF0YS1hY3Rpb24nLCAnZGVjcmVtZW50TWludXRlcycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCQoJzxzcGFuPicpLmFkZENsYXNzKG9wdGlvbnMuaWNvbnMuZG93bikpKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNFbmFibGVkKCdzJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNFbmFibGVkKCdtJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wUm93LmFwcGVuZCgkKCc8dGQ+JykuYWRkQ2xhc3MoJ3NlcGFyYXRvcicpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWlkZGxlUm93LmFwcGVuZCgkKCc8dGQ+JykuYWRkQ2xhc3MoJ3NlcGFyYXRvcicpLmh0bWwoJzonKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbVJvdy5hcHBlbmQoJCgnPHRkPicpLmFkZENsYXNzKCdzZXBhcmF0b3InKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRvcFJvdy5hcHBlbmQoJCgnPHRkPicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJCgnPGE+JykuYXR0cih7IGhyZWY6ICcjJywgdGFiaW5kZXg6ICctMScsICd0aXRsZSc6IG9wdGlvbnMudG9vbHRpcHMuaW5jcmVtZW50U2Vjb25kIH0pLmFkZENsYXNzKCdidG4nKS5hdHRyKCdkYXRhLWFjdGlvbicsICdpbmNyZW1lbnRTZWNvbmRzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJCgnPHNwYW4+JykuYWRkQ2xhc3Mob3B0aW9ucy5pY29ucy51cCkpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWlkZGxlUm93LmFwcGVuZCgkKCc8dGQ+JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgkKCc8c3Bhbj4nKS5hZGRDbGFzcygndGltZXBpY2tlci1zZWNvbmQnKS5hdHRyKHsgJ2RhdGEtdGltZS1jb21wb25lbnQnOiAnc2Vjb25kcycsICd0aXRsZSc6IG9wdGlvbnMudG9vbHRpcHMucGlja1NlY29uZCB9KS5hdHRyKCdkYXRhLWFjdGlvbicsICdzaG93U2Vjb25kcycpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tUm93LmFwcGVuZCgkKCc8dGQ+JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgkKCc8YT4nKS5hdHRyKHsgaHJlZjogJyMnLCB0YWJpbmRleDogJy0xJywgJ3RpdGxlJzogb3B0aW9ucy50b29sdGlwcy5kZWNyZW1lbnRTZWNvbmQgfSkuYWRkQ2xhc3MoJ2J0bicpLmF0dHIoJ2RhdGEtYWN0aW9uJywgJ2RlY3JlbWVudFNlY29uZHMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgkKCc8c3Bhbj4nKS5hZGRDbGFzcyhvcHRpb25zLmljb25zLmRvd24pKSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICghdXNlMjRIb3Vycykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcFJvdy5hcHBlbmQoJCgnPHRkPicpLmFkZENsYXNzKCdzZXBhcmF0b3InKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWlkZGxlUm93LmFwcGVuZCgkKCc8dGQ+JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgkKCc8YnV0dG9uPicpLmFkZENsYXNzKCdidG4gYnRuLXByaW1hcnknKS5hdHRyKHsgJ2RhdGEtYWN0aW9uJzogJ3RvZ2dsZVBlcmlvZCcsIHRhYmluZGV4OiAnLTEnLCAndGl0bGUnOiBvcHRpb25zLnRvb2x0aXBzLnRvZ2dsZVBlcmlvZCB9KSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbVJvdy5hcHBlbmQoJCgnPHRkPicpLmFkZENsYXNzKCdzZXBhcmF0b3InKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICQoJzxkaXY+JykuYWRkQ2xhc3MoJ3RpbWVwaWNrZXItcGlja2VyJylcclxuICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCQoJzx0YWJsZT4nKS5hZGRDbGFzcygndGFibGUtY29uZGVuc2VkJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChbdG9wUm93LCBtaWRkbGVSb3csIGJvdHRvbVJvd10pKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGdldFRpbWVQaWNrZXJUZW1wbGF0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBob3Vyc1ZpZXcgPSAkKCc8ZGl2PicpLmFkZENsYXNzKCd0aW1lcGlja2VyLWhvdXJzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgkKCc8dGFibGU+JykuYWRkQ2xhc3MoJ3RhYmxlLWNvbmRlbnNlZCcpKSxcclxuICAgICAgICAgICAgICAgICAgICBtaW51dGVzVmlldyA9ICQoJzxkaXY+JykuYWRkQ2xhc3MoJ3RpbWVwaWNrZXItbWludXRlcycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJCgnPHRhYmxlPicpLmFkZENsYXNzKCd0YWJsZS1jb25kZW5zZWQnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kc1ZpZXcgPSAkKCc8ZGl2PicpLmFkZENsYXNzKCd0aW1lcGlja2VyLXNlY29uZHMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCQoJzx0YWJsZT4nKS5hZGRDbGFzcygndGFibGUtY29uZGVuc2VkJykpLFxyXG4gICAgICAgICAgICAgICAgICAgIHJldCA9IFtnZXRUaW1lUGlja2VyTWFpblRlbXBsYXRlKCldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc0VuYWJsZWQoJ2gnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGhvdXJzVmlldyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNFbmFibGVkKCdtJykpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXQucHVzaChtaW51dGVzVmlldyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNFbmFibGVkKCdzJykpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXQucHVzaChzZWNvbmRzVmlldyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldDtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGdldFRvb2xiYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcm93ID0gW107XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zaG93VG9kYXlCdXR0b24pIHtcclxuICAgICAgICAgICAgICAgICAgICByb3cucHVzaCgkKCc8dGQ+JykuYXBwZW5kKCQoJzxhPicpLmF0dHIoeyAnZGF0YS1hY3Rpb24nOiAndG9kYXknLCAndGl0bGUnOiBvcHRpb25zLnRvb2x0aXBzLnRvZGF5IH0pLmFwcGVuZCgkKCc8c3Bhbj4nKS5hZGRDbGFzcyhvcHRpb25zLmljb25zLnRvZGF5KSkpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5zaWRlQnlTaWRlICYmIGhhc0RhdGUoKSAmJiBoYXNUaW1lKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByb3cucHVzaCgkKCc8dGQ+JykuYXBwZW5kKCQoJzxhPicpLmF0dHIoeyAnZGF0YS1hY3Rpb24nOiAndG9nZ2xlUGlja2VyJywgJ3RpdGxlJzogb3B0aW9ucy50b29sdGlwcy5zZWxlY3RUaW1lIH0pLmFwcGVuZCgkKCc8c3Bhbj4nKS5hZGRDbGFzcyhvcHRpb25zLmljb25zLnRpbWUpKSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2hvd0NsZWFyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93LnB1c2goJCgnPHRkPicpLmFwcGVuZCgkKCc8YT4nKS5hdHRyKHsgJ2RhdGEtYWN0aW9uJzogJ2NsZWFyJywgJ3RpdGxlJzogb3B0aW9ucy50b29sdGlwcy5jbGVhciB9KS5hcHBlbmQoJCgnPHNwYW4+JykuYWRkQ2xhc3Mob3B0aW9ucy5pY29ucy5jbGVhcikpKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zaG93Q2xvc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByb3cucHVzaCgkKCc8dGQ+JykuYXBwZW5kKCQoJzxhPicpLmF0dHIoeyAnZGF0YS1hY3Rpb24nOiAnY2xvc2UnLCAndGl0bGUnOiBvcHRpb25zLnRvb2x0aXBzLmNsb3NlIH0pLmFwcGVuZCgkKCc8c3Bhbj4nKS5hZGRDbGFzcyhvcHRpb25zLmljb25zLmNsb3NlKSkpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAkKCc8dGFibGU+JykuYWRkQ2xhc3MoJ3RhYmxlLWNvbmRlbnNlZCcpLmFwcGVuZCgkKCc8dGJvZHk+JykuYXBwZW5kKCQoJzx0cj4nKS5hcHBlbmQocm93KSkpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZ2V0VGVtcGxhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSAkKCc8ZGl2PicpLmFkZENsYXNzKCdib290c3RyYXAtZGF0ZXRpbWVwaWNrZXItd2lkZ2V0IGRyb3Bkb3duLW1lbnUnKSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRlVmlldyA9ICQoJzxkaXY+JykuYWRkQ2xhc3MoJ2RhdGVwaWNrZXInKS5hcHBlbmQoZ2V0RGF0ZVBpY2tlclRlbXBsYXRlKCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpbWVWaWV3ID0gJCgnPGRpdj4nKS5hZGRDbGFzcygndGltZXBpY2tlcicpLmFwcGVuZChnZXRUaW1lUGlja2VyVGVtcGxhdGUoKSksXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9ICQoJzx1bD4nKS5hZGRDbGFzcygnbGlzdC11bnN0eWxlZCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvb2xiYXIgPSAkKCc8bGk+JykuYWRkQ2xhc3MoJ3BpY2tlci1zd2l0Y2gnICsgKG9wdGlvbnMuY29sbGFwc2UgPyAnIGFjY29yZGlvbi10b2dnbGUnIDogJycpKS5hcHBlbmQoZ2V0VG9vbGJhcigpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5pbmxpbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZS5yZW1vdmVDbGFzcygnZHJvcGRvd24tbWVudScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh1c2UyNEhvdXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGUuYWRkQ2xhc3MoJ3VzZXR3ZW50eWZvdXInKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNFbmFibGVkKCdzJykgJiYgIXVzZTI0SG91cnMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZS5hZGRDbGFzcygnd2lkZXInKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zaWRlQnlTaWRlICYmIGhhc0RhdGUoKSAmJiBoYXNUaW1lKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZS5hZGRDbGFzcygndGltZXBpY2tlci1zYnMnKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy50b29sYmFyUGxhY2VtZW50ID09PSAndG9wJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZS5hcHBlbmQodG9vbGJhcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlLmFwcGVuZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnPGRpdj4nKS5hZGRDbGFzcygncm93JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoZGF0ZVZpZXcuYWRkQ2xhc3MoJ2NvbC1tZC02JykpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKHRpbWVWaWV3LmFkZENsYXNzKCdjb2wtbWQtNicpKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMudG9vbGJhclBsYWNlbWVudCA9PT0gJ2JvdHRvbScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGUuYXBwZW5kKHRvb2xiYXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMudG9vbGJhclBsYWNlbWVudCA9PT0gJ3RvcCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50LmFwcGVuZCh0b29sYmFyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChoYXNEYXRlKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50LmFwcGVuZCgkKCc8bGk+JykuYWRkQ2xhc3MoKG9wdGlvbnMuY29sbGFwc2UgJiYgaGFzVGltZSgpID8gJ2NvbGxhcHNlIGluJyA6ICcnKSkuYXBwZW5kKGRhdGVWaWV3KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy50b29sYmFyUGxhY2VtZW50ID09PSAnZGVmYXVsdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50LmFwcGVuZCh0b29sYmFyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChoYXNUaW1lKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50LmFwcGVuZCgkKCc8bGk+JykuYWRkQ2xhc3MoKG9wdGlvbnMuY29sbGFwc2UgJiYgaGFzRGF0ZSgpID8gJ2NvbGxhcHNlJyA6ICcnKSkuYXBwZW5kKHRpbWVWaWV3KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy50b29sYmFyUGxhY2VtZW50ID09PSAnYm90dG9tJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuYXBwZW5kKHRvb2xiYXIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlLmFwcGVuZChjb250ZW50KTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGRhdGFUb09wdGlvbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZURhdGEsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YU9wdGlvbnMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5pcygnaW5wdXQnKSB8fCBvcHRpb25zLmlubGluZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVEYXRhID0gZWxlbWVudC5kYXRhKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGVEYXRhID0gZWxlbWVudC5maW5kKCdpbnB1dCcpLmRhdGEoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZURhdGEuZGF0ZU9wdGlvbnMgJiYgZURhdGEuZGF0ZU9wdGlvbnMgaW5zdGFuY2VvZiBPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhT3B0aW9ucyA9ICQuZXh0ZW5kKHRydWUsIGRhdGFPcHRpb25zLCBlRGF0YS5kYXRlT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJC5lYWNoKG9wdGlvbnMsIGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYXR0cmlidXRlTmFtZSA9ICdkYXRlJyArIGtleS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGtleS5zbGljZSgxKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZURhdGFbYXR0cmlidXRlTmFtZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhT3B0aW9uc1trZXldID0gZURhdGFbYXR0cmlidXRlTmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YU9wdGlvbnM7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBwbGFjZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IChjb21wb25lbnQgfHwgZWxlbWVudCkucG9zaXRpb24oKSxcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSAoY29tcG9uZW50IHx8IGVsZW1lbnQpLm9mZnNldCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsID0gb3B0aW9ucy53aWRnZXRQb3NpdGlvbmluZy52ZXJ0aWNhbCxcclxuICAgICAgICAgICAgICAgICAgICBob3Jpem9udGFsID0gb3B0aW9ucy53aWRnZXRQb3NpdGlvbmluZy5ob3Jpem9udGFsLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy53aWRnZXRQYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBvcHRpb25zLndpZGdldFBhcmVudC5hcHBlbmQod2lkZ2V0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbWVudC5pcygnaW5wdXQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IGVsZW1lbnQuYWZ0ZXIod2lkZ2V0KS5wYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5pbmxpbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBlbGVtZW50LmFwcGVuZCh3aWRnZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50ID0gZWxlbWVudDtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNoaWxkcmVuKCkuZmlyc3QoKS5hZnRlcih3aWRnZXQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFRvcCBhbmQgYm90dG9tIGxvZ2ljXHJcbiAgICAgICAgICAgICAgICBpZiAodmVydGljYWwgPT09ICdhdXRvJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvZmZzZXQudG9wICsgd2lkZ2V0LmhlaWdodCgpICogMS41ID49ICQod2luZG93KS5oZWlnaHQoKSArICQod2luZG93KS5zY3JvbGxUb3AoKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQuaGVpZ2h0KCkgKyBlbGVtZW50Lm91dGVySGVpZ2h0KCkgPCBvZmZzZXQudG9wKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsID0gJ3RvcCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmVydGljYWwgPSAnYm90dG9tJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gTGVmdCBhbmQgcmlnaHQgbG9naWNcclxuICAgICAgICAgICAgICAgIGlmIChob3Jpem9udGFsID09PSAnYXV0bycpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50LndpZHRoKCkgPCBvZmZzZXQubGVmdCArIHdpZGdldC5vdXRlcldpZHRoKCkgLyAyICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldC5sZWZ0ICsgd2lkZ2V0Lm91dGVyV2lkdGgoKSA+ICQod2luZG93KS53aWR0aCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvcml6b250YWwgPSAncmlnaHQnO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvcml6b250YWwgPSAnbGVmdCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh2ZXJ0aWNhbCA9PT0gJ3RvcCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWRnZXQuYWRkQ2xhc3MoJ3RvcCcpLnJlbW92ZUNsYXNzKCdib3R0b20nKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkZ2V0LmFkZENsYXNzKCdib3R0b20nKS5yZW1vdmVDbGFzcygndG9wJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGhvcml6b250YWwgPT09ICdyaWdodCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWRnZXQuYWRkQ2xhc3MoJ3B1bGwtcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkZ2V0LnJlbW92ZUNsYXNzKCdwdWxsLXJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gZmluZCB0aGUgZmlyc3QgcGFyZW50IGVsZW1lbnQgdGhhdCBoYXMgYSBub24tc3RhdGljIGNzcyBwb3NpdGlvbmluZ1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudC5jc3MoJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudHMoKS5maWx0ZXIoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJCh0aGlzKS5jc3MoJ3Bvc2l0aW9uJykgIT09ICdzdGF0aWMnO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLmZpcnN0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2RhdGV0aW1lcGlja2VyIGNvbXBvbmVudCBzaG91bGQgYmUgcGxhY2VkIHdpdGhpbiBhIG5vbi1zdGF0aWMgcG9zaXRpb25lZCBjb250YWluZXInKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB3aWRnZXQuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IHZlcnRpY2FsID09PSAndG9wJyA/ICdhdXRvJyA6IHBvc2l0aW9uLnRvcCArIGVsZW1lbnQub3V0ZXJIZWlnaHQoKSxcclxuICAgICAgICAgICAgICAgICAgICBib3R0b206IHZlcnRpY2FsID09PSAndG9wJyA/IHBhcmVudC5vdXRlckhlaWdodCgpIC0gKHBhcmVudCA9PT0gZWxlbWVudCA/IDAgOiBwb3NpdGlvbi50b3ApIDogJ2F1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IGhvcml6b250YWwgPT09ICdsZWZ0JyA/IChwYXJlbnQgPT09IGVsZW1lbnQgPyAwIDogcG9zaXRpb24ubGVmdCkgOiAnYXV0bycsXHJcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IGhvcml6b250YWwgPT09ICdsZWZ0JyA/ICdhdXRvJyA6IHBhcmVudC5vdXRlcldpZHRoKCkgLSBlbGVtZW50Lm91dGVyV2lkdGgoKSAtIChwYXJlbnQgPT09IGVsZW1lbnQgPyAwIDogcG9zaXRpb24ubGVmdClcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbm90aWZ5RXZlbnQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUudHlwZSA9PT0gJ2RwLmNoYW5nZScgJiYgKChlLmRhdGUgJiYgZS5kYXRlLmlzU2FtZShlLm9sZERhdGUpKSB8fCAoIWUuZGF0ZSAmJiAhZS5vbGREYXRlKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnRyaWdnZXIoZSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICB2aWV3VXBkYXRlID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlID09PSAneScpIHtcclxuICAgICAgICAgICAgICAgICAgICBlID0gJ1lZWVknO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbm90aWZ5RXZlbnQoe1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkcC51cGRhdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZTogZSxcclxuICAgICAgICAgICAgICAgICAgICB2aWV3RGF0ZTogdmlld0RhdGUuY2xvbmUoKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBzaG93TW9kZSA9IGZ1bmN0aW9uIChkaXIpIHtcclxuICAgICAgICAgICAgICAgIGlmICghd2lkZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRpcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRWaWV3TW9kZSA9IE1hdGgubWF4KG1pblZpZXdNb2RlTnVtYmVyLCBNYXRoLm1pbigzLCBjdXJyZW50Vmlld01vZGUgKyBkaXIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdpZGdldC5maW5kKCcuZGF0ZXBpY2tlciA+IGRpdicpLmhpZGUoKS5maWx0ZXIoJy5kYXRlcGlja2VyLScgKyBkYXRlUGlja2VyTW9kZXNbY3VycmVudFZpZXdNb2RlXS5jbHNOYW1lKS5zaG93KCk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBmaWxsRG93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJvdyA9ICQoJzx0cj4nKSxcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RGF0ZSA9IHZpZXdEYXRlLmNsb25lKCkuc3RhcnRPZigndycpLnN0YXJ0T2YoJ2QnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5jYWxlbmRhcldlZWtzID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93LmFwcGVuZCgkKCc8dGg+JykuYWRkQ2xhc3MoJ2N3JykudGV4dCgnIycpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoY3VycmVudERhdGUuaXNCZWZvcmUodmlld0RhdGUuY2xvbmUoKS5lbmRPZigndycpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdy5hcHBlbmQoJCgnPHRoPicpLmFkZENsYXNzKCdkb3cnKS50ZXh0KGN1cnJlbnREYXRlLmZvcm1hdCgnZGQnKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnREYXRlLmFkZCgxLCAnZCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2lkZ2V0LmZpbmQoJy5kYXRlcGlja2VyLWRheXMgdGhlYWQnKS5hcHBlbmQocm93KTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGlzSW5EaXNhYmxlZERhdGVzID0gZnVuY3Rpb24gKHRlc3REYXRlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5kaXNhYmxlZERhdGVzW3Rlc3REYXRlLmZvcm1hdCgnWVlZWS1NTS1ERCcpXSA9PT0gdHJ1ZTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGlzSW5FbmFibGVkRGF0ZXMgPSBmdW5jdGlvbiAodGVzdERhdGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmVuYWJsZWREYXRlc1t0ZXN0RGF0ZS5mb3JtYXQoJ1lZWVktTU0tREQnKV0gPT09IHRydWU7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpc0luRGlzYWJsZWRIb3VycyA9IGZ1bmN0aW9uICh0ZXN0RGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZGlzYWJsZWRIb3Vyc1t0ZXN0RGF0ZS5mb3JtYXQoJ0gnKV0gPT09IHRydWU7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpc0luRW5hYmxlZEhvdXJzID0gZnVuY3Rpb24gKHRlc3REYXRlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5lbmFibGVkSG91cnNbdGVzdERhdGUuZm9ybWF0KCdIJyldID09PSB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXNWYWxpZCA9IGZ1bmN0aW9uICh0YXJnZXRNb21lbnQsIGdyYW51bGFyaXR5KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldE1vbWVudC5pc1ZhbGlkKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5kaXNhYmxlZERhdGVzICYmIGdyYW51bGFyaXR5ID09PSAnZCcgJiYgaXNJbkRpc2FibGVkRGF0ZXModGFyZ2V0TW9tZW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmVuYWJsZWREYXRlcyAmJiBncmFudWxhcml0eSA9PT0gJ2QnICYmICFpc0luRW5hYmxlZERhdGVzKHRhcmdldE1vbWVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5taW5EYXRlICYmIHRhcmdldE1vbWVudC5pc0JlZm9yZShvcHRpb25zLm1pbkRhdGUsIGdyYW51bGFyaXR5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLm1heERhdGUgJiYgdGFyZ2V0TW9tZW50LmlzQWZ0ZXIob3B0aW9ucy5tYXhEYXRlLCBncmFudWxhcml0eSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5kYXlzT2ZXZWVrRGlzYWJsZWQgJiYgZ3JhbnVsYXJpdHkgPT09ICdkJyAmJiBvcHRpb25zLmRheXNPZldlZWtEaXNhYmxlZC5pbmRleE9mKHRhcmdldE1vbWVudC5kYXkoKSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGlzYWJsZWRIb3VycyAmJiAoZ3JhbnVsYXJpdHkgPT09ICdoJyB8fCBncmFudWxhcml0eSA9PT0gJ20nIHx8IGdyYW51bGFyaXR5ID09PSAncycpICYmIGlzSW5EaXNhYmxlZEhvdXJzKHRhcmdldE1vbWVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5lbmFibGVkSG91cnMgJiYgKGdyYW51bGFyaXR5ID09PSAnaCcgfHwgZ3JhbnVsYXJpdHkgPT09ICdtJyB8fCBncmFudWxhcml0eSA9PT0gJ3MnKSAmJiAhaXNJbkVuYWJsZWRIb3Vycyh0YXJnZXRNb21lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGlzYWJsZWRUaW1lSW50ZXJ2YWxzICYmIChncmFudWxhcml0eSA9PT0gJ2gnIHx8IGdyYW51bGFyaXR5ID09PSAnbScgfHwgZ3JhbnVsYXJpdHkgPT09ICdzJykpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAkLmVhY2gob3B0aW9ucy5kaXNhYmxlZFRpbWVJbnRlcnZhbHMsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldE1vbWVudC5pc0JldHdlZW4odGhpc1swXSwgdGhpc1sxXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmb3VuZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBmaWxsTW9udGhzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNwYW5zID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGhzU2hvcnQgPSB2aWV3RGF0ZS5jbG9uZSgpLnN0YXJ0T2YoJ3knKS5zdGFydE9mKCdkJyk7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAobW9udGhzU2hvcnQuaXNTYW1lKHZpZXdEYXRlLCAneScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3BhbnMucHVzaCgkKCc8c3Bhbj4nKS5hdHRyKCdkYXRhLWFjdGlvbicsICdzZWxlY3RNb250aCcpLmFkZENsYXNzKCdtb250aCcpLnRleHQobW9udGhzU2hvcnQuZm9ybWF0KCdNTU0nKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoc1Nob3J0LmFkZCgxLCAnTScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2lkZ2V0LmZpbmQoJy5kYXRlcGlja2VyLW1vbnRocyB0ZCcpLmVtcHR5KCkuYXBwZW5kKHNwYW5zKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIHVwZGF0ZU1vbnRocyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtb250aHNWaWV3ID0gd2lkZ2V0LmZpbmQoJy5kYXRlcGlja2VyLW1vbnRocycpLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoc1ZpZXdIZWFkZXIgPSBtb250aHNWaWV3LmZpbmQoJ3RoJyksXHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGhzID0gbW9udGhzVmlldy5maW5kKCd0Ym9keScpLmZpbmQoJ3NwYW4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBtb250aHNWaWV3SGVhZGVyLmVxKDApLmZpbmQoJ3NwYW4nKS5hdHRyKCd0aXRsZScsIG9wdGlvbnMudG9vbHRpcHMucHJldlllYXIpO1xyXG4gICAgICAgICAgICAgICAgbW9udGhzVmlld0hlYWRlci5lcSgxKS5hdHRyKCd0aXRsZScsIG9wdGlvbnMudG9vbHRpcHMuc2VsZWN0WWVhcik7XHJcbiAgICAgICAgICAgICAgICBtb250aHNWaWV3SGVhZGVyLmVxKDIpLmZpbmQoJ3NwYW4nKS5hdHRyKCd0aXRsZScsIG9wdGlvbnMudG9vbHRpcHMubmV4dFllYXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIG1vbnRoc1ZpZXcuZmluZCgnLmRpc2FibGVkJykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKHZpZXdEYXRlLmNsb25lKCkuc3VidHJhY3QoMSwgJ3knKSwgJ3knKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoc1ZpZXdIZWFkZXIuZXEoMCkuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbW9udGhzVmlld0hlYWRlci5lcSgxKS50ZXh0KHZpZXdEYXRlLnllYXIoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKHZpZXdEYXRlLmNsb25lKCkuYWRkKDEsICd5JyksICd5JykpIHtcclxuICAgICAgICAgICAgICAgICAgICBtb250aHNWaWV3SGVhZGVyLmVxKDIpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG1vbnRocy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZS5pc1NhbWUodmlld0RhdGUsICd5JykgJiYgIXVuc2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGhzLmVxKGRhdGUubW9udGgoKSkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG1vbnRocy5lYWNoKGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZCh2aWV3RGF0ZS5jbG9uZSgpLm1vbnRoKGluZGV4KSwgJ00nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgdXBkYXRlWWVhcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgeWVhcnNWaWV3ID0gd2lkZ2V0LmZpbmQoJy5kYXRlcGlja2VyLXllYXJzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgeWVhcnNWaWV3SGVhZGVyID0geWVhcnNWaWV3LmZpbmQoJ3RoJyksXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRZZWFyID0gdmlld0RhdGUuY2xvbmUoKS5zdWJ0cmFjdCg1LCAneScpLFxyXG4gICAgICAgICAgICAgICAgICAgIGVuZFllYXIgPSB2aWV3RGF0ZS5jbG9uZSgpLmFkZCg2LCAneScpLFxyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICB5ZWFyc1ZpZXdIZWFkZXIuZXEoMCkuZmluZCgnc3BhbicpLmF0dHIoJ3RpdGxlJywgb3B0aW9ucy50b29sdGlwcy5wcmV2RGVjYWRlKTtcclxuICAgICAgICAgICAgICAgIHllYXJzVmlld0hlYWRlci5lcSgxKS5hdHRyKCd0aXRsZScsIG9wdGlvbnMudG9vbHRpcHMuc2VsZWN0RGVjYWRlKTtcclxuICAgICAgICAgICAgICAgIHllYXJzVmlld0hlYWRlci5lcSgyKS5maW5kKCdzcGFuJykuYXR0cigndGl0bGUnLCBvcHRpb25zLnRvb2x0aXBzLm5leHREZWNhZGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHllYXJzVmlldy5maW5kKCcuZGlzYWJsZWQnKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5taW5EYXRlICYmIG9wdGlvbnMubWluRGF0ZS5pc0FmdGVyKHN0YXJ0WWVhciwgJ3knKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHllYXJzVmlld0hlYWRlci5lcSgwKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB5ZWFyc1ZpZXdIZWFkZXIuZXEoMSkudGV4dChzdGFydFllYXIueWVhcigpICsgJy0nICsgZW5kWWVhci55ZWFyKCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLm1heERhdGUgJiYgb3B0aW9ucy5tYXhEYXRlLmlzQmVmb3JlKGVuZFllYXIsICd5JykpIHtcclxuICAgICAgICAgICAgICAgICAgICB5ZWFyc1ZpZXdIZWFkZXIuZXEoMikuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKCFzdGFydFllYXIuaXNBZnRlcihlbmRZZWFyLCAneScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSAnPHNwYW4gZGF0YS1hY3Rpb249XCJzZWxlY3RZZWFyXCIgY2xhc3M9XCJ5ZWFyJyArIChzdGFydFllYXIuaXNTYW1lKGRhdGUsICd5JykgJiYgIXVuc2V0ID8gJyBhY3RpdmUnIDogJycpICsgKCFpc1ZhbGlkKHN0YXJ0WWVhciwgJ3knKSA/ICcgZGlzYWJsZWQnIDogJycpICsgJ1wiPicgKyBzdGFydFllYXIueWVhcigpICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0WWVhci5hZGQoMSwgJ3knKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB5ZWFyc1ZpZXcuZmluZCgndGQnKS5odG1sKGh0bWwpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgdXBkYXRlRGVjYWRlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkZWNhZGVzVmlldyA9IHdpZGdldC5maW5kKCcuZGF0ZXBpY2tlci1kZWNhZGVzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjYWRlc1ZpZXdIZWFkZXIgPSBkZWNhZGVzVmlldy5maW5kKCd0aCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0RGVjYWRlID0gbW9tZW50KHsgeTogdmlld0RhdGUueWVhcigpIC0gKHZpZXdEYXRlLnllYXIoKSAlIDEwMCkgLSAxIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGVuZERlY2FkZSA9IHN0YXJ0RGVjYWRlLmNsb25lKCkuYWRkKDEwMCwgJ3knKSxcclxuICAgICAgICAgICAgICAgICAgICBzdGFydGVkQXQgPSBzdGFydERlY2FkZS5jbG9uZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG1pbkRhdGVEZWNhZGUgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBtYXhEYXRlRGVjYWRlID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgZW5kRGVjYWRlWWVhcixcclxuICAgICAgICAgICAgICAgICAgICBodG1sID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgZGVjYWRlc1ZpZXdIZWFkZXIuZXEoMCkuZmluZCgnc3BhbicpLmF0dHIoJ3RpdGxlJywgb3B0aW9ucy50b29sdGlwcy5wcmV2Q2VudHVyeSk7XHJcbiAgICAgICAgICAgICAgICBkZWNhZGVzVmlld0hlYWRlci5lcSgyKS5maW5kKCdzcGFuJykuYXR0cigndGl0bGUnLCBvcHRpb25zLnRvb2x0aXBzLm5leHRDZW50dXJ5KTtcclxuXHJcbiAgICAgICAgICAgICAgICBkZWNhZGVzVmlldy5maW5kKCcuZGlzYWJsZWQnKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnREZWNhZGUuaXNTYW1lKG1vbWVudCh7IHk6IDE5MDAgfSkpIHx8IChvcHRpb25zLm1pbkRhdGUgJiYgb3B0aW9ucy5taW5EYXRlLmlzQWZ0ZXIoc3RhcnREZWNhZGUsICd5JykpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjYWRlc1ZpZXdIZWFkZXIuZXEoMCkuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZGVjYWRlc1ZpZXdIZWFkZXIuZXEoMSkudGV4dChzdGFydERlY2FkZS55ZWFyKCkgKyAnLScgKyBlbmREZWNhZGUueWVhcigpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnREZWNhZGUuaXNTYW1lKG1vbWVudCh7IHk6IDIwMDAgfSkpIHx8IChvcHRpb25zLm1heERhdGUgJiYgb3B0aW9ucy5tYXhEYXRlLmlzQmVmb3JlKGVuZERlY2FkZSwgJ3knKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWNhZGVzVmlld0hlYWRlci5lcSgyKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIXN0YXJ0RGVjYWRlLmlzQWZ0ZXIoZW5kRGVjYWRlLCAneScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kRGVjYWRlWWVhciA9IHN0YXJ0RGVjYWRlLnllYXIoKSArIDEyO1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbkRhdGVEZWNhZGUgPSBvcHRpb25zLm1pbkRhdGUgJiYgb3B0aW9ucy5taW5EYXRlLmlzQWZ0ZXIoc3RhcnREZWNhZGUsICd5JykgJiYgb3B0aW9ucy5taW5EYXRlLnllYXIoKSA8PSBlbmREZWNhZGVZZWFyO1xyXG4gICAgICAgICAgICAgICAgICAgIG1heERhdGVEZWNhZGUgPSBvcHRpb25zLm1heERhdGUgJiYgb3B0aW9ucy5tYXhEYXRlLmlzQWZ0ZXIoc3RhcnREZWNhZGUsICd5JykgJiYgb3B0aW9ucy5tYXhEYXRlLnllYXIoKSA8PSBlbmREZWNhZGVZZWFyO1xyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxzcGFuIGRhdGEtYWN0aW9uPVwic2VsZWN0RGVjYWRlXCIgY2xhc3M9XCJkZWNhZGUnICsgKGRhdGUuaXNBZnRlcihzdGFydERlY2FkZSkgJiYgZGF0ZS55ZWFyKCkgPD0gZW5kRGVjYWRlWWVhciA/ICcgYWN0aXZlJyA6ICcnKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICghaXNWYWxpZChzdGFydERlY2FkZSwgJ3knKSAmJiAhbWluRGF0ZURlY2FkZSAmJiAhbWF4RGF0ZURlY2FkZSA/ICcgZGlzYWJsZWQnIDogJycpICsgJ1wiIGRhdGEtc2VsZWN0aW9uPVwiJyArIChzdGFydERlY2FkZS55ZWFyKCkgKyA2KSArICdcIj4nICsgKHN0YXJ0RGVjYWRlLnllYXIoKSArIDEpICsgJyAtICcgKyAoc3RhcnREZWNhZGUueWVhcigpICsgMTIpICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0RGVjYWRlLmFkZCgxMiwgJ3knKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxzcGFuPjwvc3Bhbj48c3Bhbj48L3NwYW4+PHNwYW4+PC9zcGFuPic7IC8vcHVzaCB0aGUgZGFuZ2xpbmcgYmxvY2sgb3ZlciwgYXQgbGVhc3QgdGhpcyB3YXkgaXQncyBldmVuXHJcblxyXG4gICAgICAgICAgICAgICAgZGVjYWRlc1ZpZXcuZmluZCgndGQnKS5odG1sKGh0bWwpO1xyXG4gICAgICAgICAgICAgICAgZGVjYWRlc1ZpZXdIZWFkZXIuZXEoMSkudGV4dCgoc3RhcnRlZEF0LnllYXIoKSArIDEpICsgJy0nICsgKHN0YXJ0RGVjYWRlLnllYXIoKSkpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZmlsbERhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF5c1ZpZXcgPSB3aWRnZXQuZmluZCgnLmRhdGVwaWNrZXItZGF5cycpLFxyXG4gICAgICAgICAgICAgICAgICAgIGRheXNWaWV3SGVhZGVyID0gZGF5c1ZpZXcuZmluZCgndGgnKSxcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBodG1sID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgcm93LFxyXG4gICAgICAgICAgICAgICAgICAgIGNsc05hbWVzID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgaTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWhhc0RhdGUoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBkYXlzVmlld0hlYWRlci5lcSgwKS5maW5kKCdzcGFuJykuYXR0cigndGl0bGUnLCBvcHRpb25zLnRvb2x0aXBzLnByZXZNb250aCk7XHJcbiAgICAgICAgICAgICAgICBkYXlzVmlld0hlYWRlci5lcSgxKS5hdHRyKCd0aXRsZScsIG9wdGlvbnMudG9vbHRpcHMuc2VsZWN0TW9udGgpO1xyXG4gICAgICAgICAgICAgICAgZGF5c1ZpZXdIZWFkZXIuZXEoMikuZmluZCgnc3BhbicpLmF0dHIoJ3RpdGxlJywgb3B0aW9ucy50b29sdGlwcy5uZXh0TW9udGgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGRheXNWaWV3LmZpbmQoJy5kaXNhYmxlZCcpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICAgICAgZGF5c1ZpZXdIZWFkZXIuZXEoMSkudGV4dCh2aWV3RGF0ZS5mb3JtYXQob3B0aW9ucy5kYXlWaWV3SGVhZGVyRm9ybWF0KSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKHZpZXdEYXRlLmNsb25lKCkuc3VidHJhY3QoMSwgJ00nKSwgJ00nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRheXNWaWV3SGVhZGVyLmVxKDApLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKHZpZXdEYXRlLmNsb25lKCkuYWRkKDEsICdNJyksICdNJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXlzVmlld0hlYWRlci5lcSgyKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RGF0ZSA9IHZpZXdEYXRlLmNsb25lKCkuc3RhcnRPZignTScpLnN0YXJ0T2YoJ3cnKS5zdGFydE9mKCdkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDQyOyBpKyspIHsgLy9hbHdheXMgZGlzcGxheSA0MiBkYXlzIChzaG91bGQgc2hvdyA2IHdlZWtzKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50RGF0ZS53ZWVrZGF5KCkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm93ID0gJCgnPHRyPicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5jYWxlbmRhcldlZWtzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3cuYXBwZW5kKCc8dGQgY2xhc3M9XCJjd1wiPicgKyBjdXJyZW50RGF0ZS53ZWVrKCkgKyAnPC90ZD4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sLnB1c2gocm93KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2xzTmFtZXMgPSBbJ2RheSddO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50RGF0ZS5pc0JlZm9yZSh2aWV3RGF0ZSwgJ00nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHNOYW1lcy5wdXNoKCdvbGQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnREYXRlLmlzQWZ0ZXIodmlld0RhdGUsICdNJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xzTmFtZXMucHVzaCgnbmV3Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50RGF0ZS5pc1NhbWUoZGF0ZSwgJ2QnKSAmJiAhdW5zZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xzTmFtZXMucHVzaCgnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZChjdXJyZW50RGF0ZSwgJ2QnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHNOYW1lcy5wdXNoKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudERhdGUuaXNTYW1lKGdldE1vbWVudCgpLCAnZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsc05hbWVzLnB1c2goJ3RvZGF5Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50RGF0ZS5kYXkoKSA9PT0gMCB8fCBjdXJyZW50RGF0ZS5kYXkoKSA9PT0gNikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHNOYW1lcy5wdXNoKCd3ZWVrZW5kJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmeUV2ZW50KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RwLmNsYXNzaWZ5JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZTogY3VycmVudERhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM6IGNsc05hbWVzXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93LmFwcGVuZCgnPHRkIGRhdGEtYWN0aW9uPVwic2VsZWN0RGF5XCIgZGF0YS1kYXk9XCInICsgY3VycmVudERhdGUuZm9ybWF0KCdMJykgKyAnXCIgY2xhc3M9XCInICsgY2xzTmFtZXMuam9pbignICcpICsgJ1wiPicgKyBjdXJyZW50RGF0ZS5kYXRlKCkgKyAnPC90ZD4nKTtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RGF0ZS5hZGQoMSwgJ2QnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBkYXlzVmlldy5maW5kKCd0Ym9keScpLmVtcHR5KCkuYXBwZW5kKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgICAgIHVwZGF0ZU1vbnRocygpO1xyXG5cclxuICAgICAgICAgICAgICAgIHVwZGF0ZVllYXJzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdXBkYXRlRGVjYWRlcygpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZmlsbEhvdXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRhYmxlID0gd2lkZ2V0LmZpbmQoJy50aW1lcGlja2VyLWhvdXJzIHRhYmxlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEhvdXIgPSB2aWV3RGF0ZS5jbG9uZSgpLnN0YXJ0T2YoJ2QnKSxcclxuICAgICAgICAgICAgICAgICAgICBodG1sID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgcm93ID0gJCgnPHRyPicpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh2aWV3RGF0ZS5ob3VyKCkgPiAxMSAmJiAhdXNlMjRIb3Vycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRIb3VyLmhvdXIoMTIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGN1cnJlbnRIb3VyLmlzU2FtZSh2aWV3RGF0ZSwgJ2QnKSAmJiAodXNlMjRIb3VycyB8fCAodmlld0RhdGUuaG91cigpIDwgMTIgJiYgY3VycmVudEhvdXIuaG91cigpIDwgMTIpIHx8IHZpZXdEYXRlLmhvdXIoKSA+IDExKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SG91ci5ob3VyKCkgJSA0ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdyA9ICQoJzx0cj4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbC5wdXNoKHJvdyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJvdy5hcHBlbmQoJzx0ZCBkYXRhLWFjdGlvbj1cInNlbGVjdEhvdXJcIiBjbGFzcz1cImhvdXInICsgKCFpc1ZhbGlkKGN1cnJlbnRIb3VyLCAnaCcpID8gJyBkaXNhYmxlZCcgOiAnJykgKyAnXCI+JyArIGN1cnJlbnRIb3VyLmZvcm1hdCh1c2UyNEhvdXJzID8gJ0hIJyA6ICdoaCcpICsgJzwvdGQ+Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEhvdXIuYWRkKDEsICdoJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0YWJsZS5lbXB0eSgpLmFwcGVuZChodG1sKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGZpbGxNaW51dGVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRhYmxlID0gd2lkZ2V0LmZpbmQoJy50aW1lcGlja2VyLW1pbnV0ZXMgdGFibGUnKSxcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50TWludXRlID0gdmlld0RhdGUuY2xvbmUoKS5zdGFydE9mKCdoJyksXHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdyA9ICQoJzx0cj4nKSxcclxuICAgICAgICAgICAgICAgICAgICBzdGVwID0gb3B0aW9ucy5zdGVwcGluZyA9PT0gMSA/IDUgOiBvcHRpb25zLnN0ZXBwaW5nO1xyXG5cclxuICAgICAgICAgICAgICAgIHdoaWxlICh2aWV3RGF0ZS5pc1NhbWUoY3VycmVudE1pbnV0ZSwgJ2gnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50TWludXRlLm1pbnV0ZSgpICUgKHN0ZXAgKiA0KSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByb3cgPSAkKCc8dHI+Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwucHVzaChyb3cpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByb3cuYXBwZW5kKCc8dGQgZGF0YS1hY3Rpb249XCJzZWxlY3RNaW51dGVcIiBjbGFzcz1cIm1pbnV0ZScgKyAoIWlzVmFsaWQoY3VycmVudE1pbnV0ZSwgJ20nKSA/ICcgZGlzYWJsZWQnIDogJycpICsgJ1wiPicgKyBjdXJyZW50TWludXRlLmZvcm1hdCgnbW0nKSArICc8L3RkPicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNaW51dGUuYWRkKHN0ZXAsICdtJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0YWJsZS5lbXB0eSgpLmFwcGVuZChodG1sKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGZpbGxTZWNvbmRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRhYmxlID0gd2lkZ2V0LmZpbmQoJy50aW1lcGlja2VyLXNlY29uZHMgdGFibGUnKSxcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U2Vjb25kID0gdmlld0RhdGUuY2xvbmUoKS5zdGFydE9mKCdtJyksXHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdyA9ICQoJzx0cj4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAodmlld0RhdGUuaXNTYW1lKGN1cnJlbnRTZWNvbmQsICdtJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNlY29uZC5zZWNvbmQoKSAlIDIwID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdyA9ICQoJzx0cj4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbC5wdXNoKHJvdyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJvdy5hcHBlbmQoJzx0ZCBkYXRhLWFjdGlvbj1cInNlbGVjdFNlY29uZFwiIGNsYXNzPVwic2Vjb25kJyArICghaXNWYWxpZChjdXJyZW50U2Vjb25kLCAncycpID8gJyBkaXNhYmxlZCcgOiAnJykgKyAnXCI+JyArIGN1cnJlbnRTZWNvbmQuZm9ybWF0KCdzcycpICsgJzwvdGQ+Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFNlY29uZC5hZGQoNSwgJ3MnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YWJsZS5lbXB0eSgpLmFwcGVuZChodG1sKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGZpbGxUaW1lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRvZ2dsZSwgbmV3RGF0ZSwgdGltZUNvbXBvbmVudHMgPSB3aWRnZXQuZmluZCgnLnRpbWVwaWNrZXIgc3BhbltkYXRhLXRpbWUtY29tcG9uZW50XScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghdXNlMjRIb3Vycykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZSA9IHdpZGdldC5maW5kKCcudGltZXBpY2tlciBbZGF0YS1hY3Rpb249dG9nZ2xlUGVyaW9kXScpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBkYXRlLmNsb25lKCkuYWRkKChkYXRlLmhvdXJzKCkgPj0gMTIpID8gLTEyIDogMTIsICdoJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZS50ZXh0KGRhdGUuZm9ybWF0KCdBJykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNWYWxpZChuZXdEYXRlLCAnaCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2dnbGUuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGltZUNvbXBvbmVudHMuZmlsdGVyKCdbZGF0YS10aW1lLWNvbXBvbmVudD1ob3Vyc10nKS50ZXh0KGRhdGUuZm9ybWF0KHVzZTI0SG91cnMgPyAnSEgnIDogJ2hoJykpO1xyXG4gICAgICAgICAgICAgICAgdGltZUNvbXBvbmVudHMuZmlsdGVyKCdbZGF0YS10aW1lLWNvbXBvbmVudD1taW51dGVzXScpLnRleHQoZGF0ZS5mb3JtYXQoJ21tJykpO1xyXG4gICAgICAgICAgICAgICAgdGltZUNvbXBvbmVudHMuZmlsdGVyKCdbZGF0YS10aW1lLWNvbXBvbmVudD1zZWNvbmRzXScpLnRleHQoZGF0ZS5mb3JtYXQoJ3NzJykpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZpbGxIb3VycygpO1xyXG4gICAgICAgICAgICAgICAgZmlsbE1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgICAgIGZpbGxTZWNvbmRzKCk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICB1cGRhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXdpZGdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZpbGxEYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBmaWxsVGltZSgpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgc2V0VmFsdWUgPSBmdW5jdGlvbiAodGFyZ2V0TW9tZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2xkRGF0ZSA9IHVuc2V0ID8gbnVsbCA6IGRhdGU7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY2FzZSBvZiBjYWxsaW5nIHNldFZhbHVlKG51bGwgb3IgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldE1vbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVuc2V0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dC52YWwoJycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZGF0YSgnZGF0ZScsICcnKTtcclxuICAgICAgICAgICAgICAgICAgICBub3RpZnlFdmVudCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkcC5jaGFuZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb2xkRGF0ZTogb2xkRGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YXJnZXRNb21lbnQgPSB0YXJnZXRNb21lbnQuY2xvbmUoKS5sb2NhbGUob3B0aW9ucy5sb2NhbGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChoYXNUaW1lWm9uZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TW9tZW50LnR6KG9wdGlvbnMudGltZVpvbmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnN0ZXBwaW5nICE9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TW9tZW50Lm1pbnV0ZXMoKE1hdGgucm91bmQodGFyZ2V0TW9tZW50Lm1pbnV0ZXMoKSAvIG9wdGlvbnMuc3RlcHBpbmcpICogb3B0aW9ucy5zdGVwcGluZykpLnNlY29uZHMoMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChvcHRpb25zLm1pbkRhdGUgJiYgdGFyZ2V0TW9tZW50LmlzQmVmb3JlKG9wdGlvbnMubWluRGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TW9tZW50LmFkZChvcHRpb25zLnN0ZXBwaW5nLCAnbWludXRlcycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNWYWxpZCh0YXJnZXRNb21lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZSA9IHRhcmdldE1vbWVudDtcclxuICAgICAgICAgICAgICAgICAgICB2aWV3RGF0ZSA9IGRhdGUuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dC52YWwoZGF0ZS5mb3JtYXQoYWN0dWFsRm9ybWF0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5kYXRhKCdkYXRlJywgZGF0ZS5mb3JtYXQoYWN0dWFsRm9ybWF0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5zZXQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBub3RpZnlFdmVudCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkcC5jaGFuZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlOiBkYXRlLmNsb25lKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9sZERhdGU6IG9sZERhdGVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLmtlZXBJbnZhbGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LnZhbCh1bnNldCA/ICcnIDogZGF0ZS5mb3JtYXQoYWN0dWFsRm9ybWF0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm90aWZ5RXZlbnQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RwLmNoYW5nZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlOiB0YXJnZXRNb21lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGREYXRlOiBvbGREYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBub3RpZnlFdmVudCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkcC5lcnJvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGU6IHRhcmdldE1vbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb2xkRGF0ZTogb2xkRGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIEhpZGVzIHRoZSB3aWRnZXQuIFBvc3NpYmx5IHdpbGwgZW1pdCBkcC5oaWRlXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBoaWRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRyYW5zaXRpb25pbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmICghd2lkZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIElnbm9yZSBldmVudCBpZiBpbiB0aGUgbWlkZGxlIG9mIGEgcGlja2VyIHRyYW5zaXRpb25cclxuICAgICAgICAgICAgICAgIHdpZGdldC5maW5kKCcuY29sbGFwc2UnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY29sbGFwc2VEYXRhID0gJCh0aGlzKS5kYXRhKCdjb2xsYXBzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2xsYXBzZURhdGEgJiYgY29sbGFwc2VEYXRhLnRyYW5zaXRpb25pbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbmluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQgJiYgY29tcG9uZW50Lmhhc0NsYXNzKCdidG4nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC50b2dnbGVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aWRnZXQuaGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZScsIHBsYWNlKTtcclxuICAgICAgICAgICAgICAgIHdpZGdldC5vZmYoJ2NsaWNrJywgJ1tkYXRhLWFjdGlvbl0nKTtcclxuICAgICAgICAgICAgICAgIHdpZGdldC5vZmYoJ21vdXNlZG93bicsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICB3aWRnZXQucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB3aWRnZXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICBub3RpZnlFdmVudCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RwLmhpZGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGRhdGUuY2xvbmUoKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaW5wdXQuYmx1cigpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZpZXdEYXRlID0gZGF0ZS5jbG9uZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBjbGVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHNldFZhbHVlKG51bGwpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgcGFyc2VJbnB1dERhdGUgPSBmdW5jdGlvbiAoaW5wdXREYXRlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5wYXJzZUlucHV0RGF0ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtb21lbnQuaXNNb21lbnQoaW5wdXREYXRlKSB8fCBpbnB1dERhdGUgaW5zdGFuY2VvZiBEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0RGF0ZSA9IGdldE1vbWVudChpbnB1dERhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXREYXRlID0gb3B0aW9ucy5wYXJzZUlucHV0RGF0ZShpbnB1dERhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9pbnB1dERhdGUubG9jYWxlKG9wdGlvbnMubG9jYWxlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbnB1dERhdGU7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICogV2lkZ2V0IFVJIGludGVyYWN0aW9uIGZ1bmN0aW9uc1xyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICAgICAgICAgIGFjdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5hdkZuYyA9IGRhdGVQaWNrZXJNb2Rlc1tjdXJyZW50Vmlld01vZGVdLm5hdkZuYztcclxuICAgICAgICAgICAgICAgICAgICB2aWV3RGF0ZS5hZGQoZGF0ZVBpY2tlck1vZGVzW2N1cnJlbnRWaWV3TW9kZV0ubmF2U3RlcCwgbmF2Rm5jKTtcclxuICAgICAgICAgICAgICAgICAgICBmaWxsRGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZpZXdVcGRhdGUobmF2Rm5jKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmF2Rm5jID0gZGF0ZVBpY2tlck1vZGVzW2N1cnJlbnRWaWV3TW9kZV0ubmF2Rm5jO1xyXG4gICAgICAgICAgICAgICAgICAgIHZpZXdEYXRlLnN1YnRyYWN0KGRhdGVQaWNrZXJNb2Rlc1tjdXJyZW50Vmlld01vZGVdLm5hdlN0ZXAsIG5hdkZuYyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsbERhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB2aWV3VXBkYXRlKG5hdkZuYyk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIHBpY2tlclN3aXRjaDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3dNb2RlKDEpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RNb250aDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbW9udGggPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCd0Ym9keScpLmZpbmQoJ3NwYW4nKS5pbmRleCgkKGUudGFyZ2V0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmlld0RhdGUubW9udGgobW9udGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Vmlld01vZGUgPT09IG1pblZpZXdNb2RlTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlKGRhdGUuY2xvbmUoKS55ZWFyKHZpZXdEYXRlLnllYXIoKSkubW9udGgodmlld0RhdGUubW9udGgoKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMuaW5saW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93TW9kZSgtMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxEYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHZpZXdVcGRhdGUoJ00nKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZWN0WWVhcjogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeWVhciA9IHBhcnNlSW50KCQoZS50YXJnZXQpLnRleHQoKSwgMTApIHx8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgdmlld0RhdGUueWVhcih5ZWFyKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFZpZXdNb2RlID09PSBtaW5WaWV3TW9kZU51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZShkYXRlLmNsb25lKCkueWVhcih2aWV3RGF0ZS55ZWFyKCkpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLmlubGluZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01vZGUoLTEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsRGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB2aWV3VXBkYXRlKCdZWVlZJyk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIHNlbGVjdERlY2FkZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeWVhciA9IHBhcnNlSW50KCQoZS50YXJnZXQpLmRhdGEoJ3NlbGVjdGlvbicpLCAxMCkgfHwgMDtcclxuICAgICAgICAgICAgICAgICAgICB2aWV3RGF0ZS55ZWFyKHllYXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Vmlld01vZGUgPT09IG1pblZpZXdNb2RlTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlKGRhdGUuY2xvbmUoKS55ZWFyKHZpZXdEYXRlLnllYXIoKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMuaW5saW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93TW9kZSgtMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxEYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHZpZXdVcGRhdGUoJ1lZWVknKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZWN0RGF5OiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXkgPSB2aWV3RGF0ZS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkKGUudGFyZ2V0KS5pcygnLm9sZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRheS5zdWJ0cmFjdCgxLCAnTScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoJChlLnRhcmdldCkuaXMoJy5uZXcnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXkuYWRkKDEsICdNJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlKGRheS5kYXRlKHBhcnNlSW50KCQoZS50YXJnZXQpLnRleHQoKSwgMTApKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFoYXNUaW1lKCkgJiYgIW9wdGlvbnMua2VlcE9wZW4gJiYgIW9wdGlvbnMuaW5saW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIGluY3JlbWVudEhvdXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0RhdGUgPSBkYXRlLmNsb25lKCkuYWRkKDEsICdoJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzVmFsaWQobmV3RGF0ZSwgJ2gnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZShuZXdEYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIGluY3JlbWVudE1pbnV0ZXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3RGF0ZSA9IGRhdGUuY2xvbmUoKS5hZGQob3B0aW9ucy5zdGVwcGluZywgJ20nKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNWYWxpZChuZXdEYXRlLCAnbScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlKG5ld0RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgaW5jcmVtZW50U2Vjb25kczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdEYXRlID0gZGF0ZS5jbG9uZSgpLmFkZCgxLCAncycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1ZhbGlkKG5ld0RhdGUsICdzJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUobmV3RGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBkZWNyZW1lbnRIb3VyczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdEYXRlID0gZGF0ZS5jbG9uZSgpLnN1YnRyYWN0KDEsICdoJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzVmFsaWQobmV3RGF0ZSwgJ2gnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZShuZXdEYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIGRlY3JlbWVudE1pbnV0ZXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3RGF0ZSA9IGRhdGUuY2xvbmUoKS5zdWJ0cmFjdChvcHRpb25zLnN0ZXBwaW5nLCAnbScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1ZhbGlkKG5ld0RhdGUsICdtJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUobmV3RGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBkZWNyZW1lbnRTZWNvbmRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0RhdGUgPSBkYXRlLmNsb25lKCkuc3VidHJhY3QoMSwgJ3MnKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNWYWxpZChuZXdEYXRlLCAncycpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlKG5ld0RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgdG9nZ2xlUGVyaW9kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUoZGF0ZS5jbG9uZSgpLmFkZCgoZGF0ZS5ob3VycygpID49IDEyKSA/IC0xMiA6IDEyLCAnaCcpKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgdG9nZ2xlUGlja2VyOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQoZS50YXJnZXQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkcGFyZW50ID0gJHRoaXMuY2xvc2VzdCgndWwnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwYW5kZWQgPSAkcGFyZW50LmZpbmQoJy5pbicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZWQgPSAkcGFyZW50LmZpbmQoJy5jb2xsYXBzZTpub3QoLmluKScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZURhdGE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChleHBhbmRlZCAmJiBleHBhbmRlZC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VEYXRhID0gZXhwYW5kZWQuZGF0YSgnY29sbGFwc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbGxhcHNlRGF0YSAmJiBjb2xsYXBzZURhdGEudHJhbnNpdGlvbmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHBhbmRlZC5jb2xsYXBzZSkgeyAvLyBpZiBjb2xsYXBzZSBwbHVnaW4gaXMgYXZhaWxhYmxlIHRocm91Z2ggYm9vdHN0cmFwLmpzIHRoZW4gdXNlIGl0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBhbmRlZC5jb2xsYXBzZSgnaGlkZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VkLmNvbGxhcHNlKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIG90aGVyd2lzZSBqdXN0IHRvZ2dsZSBpbiBjbGFzcyBvbiB0aGUgdHdvIHZpZXdzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBhbmRlZC5yZW1vdmVDbGFzcygnaW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlZC5hZGRDbGFzcygnaW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHRoaXMuaXMoJ3NwYW4nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRoaXMudG9nZ2xlQ2xhc3Mob3B0aW9ucy5pY29ucy50aW1lICsgJyAnICsgb3B0aW9ucy5pY29ucy5kYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aGlzLmZpbmQoJ3NwYW4nKS50b2dnbGVDbGFzcyhvcHRpb25zLmljb25zLnRpbWUgKyAnICcgKyBvcHRpb25zLmljb25zLmRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOT1RFOiB1bmNvbW1lbnQgaWYgdG9nZ2xlZCBzdGF0ZSB3aWxsIGJlIHJlc3RvcmVkIGluIHNob3coKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIChjb21wb25lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgY29tcG9uZW50LmZpbmQoJ3NwYW4nKS50b2dnbGVDbGFzcyhvcHRpb25zLmljb25zLnRpbWUgKyAnICcgKyBvcHRpb25zLmljb25zLmRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL31cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIHNob3dQaWNrZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWRnZXQuZmluZCgnLnRpbWVwaWNrZXIgPiBkaXY6bm90KC50aW1lcGlja2VyLXBpY2tlciknKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkZ2V0LmZpbmQoJy50aW1lcGlja2VyIC50aW1lcGlja2VyLXBpY2tlcicpLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgc2hvd0hvdXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkZ2V0LmZpbmQoJy50aW1lcGlja2VyIC50aW1lcGlja2VyLXBpY2tlcicpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB3aWRnZXQuZmluZCgnLnRpbWVwaWNrZXIgLnRpbWVwaWNrZXItaG91cnMnKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIHNob3dNaW51dGVzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkZ2V0LmZpbmQoJy50aW1lcGlja2VyIC50aW1lcGlja2VyLXBpY2tlcicpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB3aWRnZXQuZmluZCgnLnRpbWVwaWNrZXIgLnRpbWVwaWNrZXItbWludXRlcycpLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgc2hvd1NlY29uZHM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWRnZXQuZmluZCgnLnRpbWVwaWNrZXIgLnRpbWVwaWNrZXItcGlja2VyJykuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHdpZGdldC5maW5kKCcudGltZXBpY2tlciAudGltZXBpY2tlci1zZWNvbmRzJykuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RIb3VyOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBob3VyID0gcGFyc2VJbnQoJChlLnRhcmdldCkudGV4dCgpLCAxMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdXNlMjRIb3Vycykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0ZS5ob3VycygpID49IDEyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaG91ciAhPT0gMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3VyICs9IDEyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhvdXIgPT09IDEyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG91ciA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUoZGF0ZS5jbG9uZSgpLmhvdXJzKGhvdXIpKTtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25zLnNob3dQaWNrZXIuY2FsbChwaWNrZXIpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RNaW51dGU6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUoZGF0ZS5jbG9uZSgpLm1pbnV0ZXMocGFyc2VJbnQoJChlLnRhcmdldCkudGV4dCgpLCAxMCkpKTtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25zLnNob3dQaWNrZXIuY2FsbChwaWNrZXIpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RTZWNvbmQ6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUoZGF0ZS5jbG9uZSgpLnNlY29uZHMocGFyc2VJbnQoJChlLnRhcmdldCkudGV4dCgpLCAxMCkpKTtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25zLnNob3dQaWNrZXIuY2FsbChwaWNrZXIpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBjbGVhcjogY2xlYXIsXHJcblxyXG4gICAgICAgICAgICAgICAgdG9kYXk6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdG9kYXlzRGF0ZSA9IGdldE1vbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1ZhbGlkKHRvZGF5c0RhdGUsICdkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUodG9kYXlzRGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBjbG9zZTogaGlkZVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZG9BY3Rpb24gPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoZS5jdXJyZW50VGFyZ2V0KS5pcygnLmRpc2FibGVkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhY3Rpb25zWyQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCdhY3Rpb24nKV0uYXBwbHkocGlja2VyLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIFNob3dzIHRoZSB3aWRnZXQuIFBvc3NpYmx5IHdpbGwgZW1pdCBkcC5zaG93IGFuZCBkcC5jaGFuZ2VcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHNob3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudE1vbWVudCxcclxuICAgICAgICAgICAgICAgICAgICB1c2VDdXJyZW50R3JhbnVsYXJpdHkgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICd5ZWFyJzogZnVuY3Rpb24gKG0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLm1vbnRoKDApLmRhdGUoMSkuaG91cnMoMCkuc2Vjb25kcygwKS5taW51dGVzKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbW9udGgnOiBmdW5jdGlvbiAobSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uZGF0ZSgxKS5ob3VycygwKS5zZWNvbmRzKDApLm1pbnV0ZXMoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXknOiBmdW5jdGlvbiAobSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uaG91cnMoMCkuc2Vjb25kcygwKS5taW51dGVzKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnaG91cic6IGZ1bmN0aW9uIChtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5zZWNvbmRzKDApLm1pbnV0ZXMoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdtaW51dGUnOiBmdW5jdGlvbiAobSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uc2Vjb25kcygwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LnByb3AoJ2Rpc2FibGVkJykgfHwgKCFvcHRpb25zLmlnbm9yZVJlYWRvbmx5ICYmIGlucHV0LnByb3AoJ3JlYWRvbmx5JykpIHx8IHdpZGdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQudmFsKCkgIT09IHVuZGVmaW5lZCAmJiBpbnB1dC52YWwoKS50cmltKCkubGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUocGFyc2VJbnB1dERhdGUoaW5wdXQudmFsKCkudHJpbSgpKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVuc2V0ICYmIG9wdGlvbnMudXNlQ3VycmVudCAmJiAob3B0aW9ucy5pbmxpbmUgfHwgKGlucHV0LmlzKCdpbnB1dCcpICYmIGlucHV0LnZhbCgpLnRyaW0oKS5sZW5ndGggPT09IDApKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb21lbnQgPSBnZXRNb21lbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMudXNlQ3VycmVudCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vbWVudCA9IHVzZUN1cnJlbnRHcmFudWxhcml0eVtvcHRpb25zLnVzZUN1cnJlbnRdKGN1cnJlbnRNb21lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZShjdXJyZW50TW9tZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdpZGdldCA9IGdldFRlbXBsYXRlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZmlsbERvdygpO1xyXG4gICAgICAgICAgICAgICAgZmlsbE1vbnRocygpO1xyXG5cclxuICAgICAgICAgICAgICAgIHdpZGdldC5maW5kKCcudGltZXBpY2tlci1ob3VycycpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHdpZGdldC5maW5kKCcudGltZXBpY2tlci1taW51dGVzJykuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0LmZpbmQoJy50aW1lcGlja2VyLXNlY29uZHMnKS5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBzaG93TW9kZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgcGxhY2UpO1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0Lm9uKCdjbGljaycsICdbZGF0YS1hY3Rpb25dJywgZG9BY3Rpb24pOyAvLyB0aGlzIGhhbmRsZXMgY2xpY2tzIG9uIHRoZSB3aWRnZXRcclxuICAgICAgICAgICAgICAgIHdpZGdldC5vbignbW91c2Vkb3duJywgZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQgJiYgY29tcG9uZW50Lmhhc0NsYXNzKCdidG4nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC50b2dnbGVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwbGFjZSgpO1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0LnNob3coKTtcclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmZvY3VzT25TaG93ICYmICFpbnB1dC5pcygnOmZvY3VzJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG5vdGlmeUV2ZW50KHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZHAuc2hvdydcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBTaG93cyBvciBoaWRlcyB0aGUgd2lkZ2V0XHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB0b2dnbGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHdpZGdldCA/IGhpZGUoKSA6IHNob3coKSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBrZXlkb3duID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBoYW5kbGVyID0gbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBpbmRleCxcclxuICAgICAgICAgICAgICAgICAgICBpbmRleDIsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlc3NlZEtleXMgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICBwcmVzc2VkTW9kaWZpZXJzID0ge30sXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEtleSA9IGUud2hpY2gsXHJcbiAgICAgICAgICAgICAgICAgICAga2V5QmluZEtleXMsXHJcbiAgICAgICAgICAgICAgICAgICAgYWxsTW9kaWZpZXJzUHJlc3NlZCxcclxuICAgICAgICAgICAgICAgICAgICBwcmVzc2VkID0gJ3AnO1xyXG5cclxuICAgICAgICAgICAgICAgIGtleVN0YXRlW2N1cnJlbnRLZXldID0gcHJlc3NlZDtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGluZGV4IGluIGtleVN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleVN0YXRlLmhhc093blByb3BlcnR5KGluZGV4KSAmJiBrZXlTdGF0ZVtpbmRleF0gPT09IHByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlc3NlZEtleXMucHVzaChpbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChpbmRleCwgMTApICE9PSBjdXJyZW50S2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVzc2VkTW9kaWZpZXJzW2luZGV4XSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpbmRleCBpbiBvcHRpb25zLmtleUJpbmRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMua2V5QmluZHMuaGFzT3duUHJvcGVydHkoaW5kZXgpICYmIHR5cGVvZiAob3B0aW9ucy5rZXlCaW5kc1tpbmRleF0pID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleUJpbmRLZXlzID0gaW5kZXguc3BsaXQoJyAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleUJpbmRLZXlzLmxlbmd0aCA9PT0gcHJlc3NlZEtleXMubGVuZ3RoICYmIGtleU1hcFtjdXJyZW50S2V5XSA9PT0ga2V5QmluZEtleXNba2V5QmluZEtleXMubGVuZ3RoIC0gMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsbE1vZGlmaWVyc1ByZXNzZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpbmRleDIgPSBrZXlCaW5kS2V5cy5sZW5ndGggLSAyOyBpbmRleDIgPj0gMDsgaW5kZXgyLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShrZXlNYXBba2V5QmluZEtleXNbaW5kZXgyXV0gaW4gcHJlc3NlZE1vZGlmaWVycykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsTW9kaWZpZXJzUHJlc3NlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWxsTW9kaWZpZXJzUHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBvcHRpb25zLmtleUJpbmRzW2luZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIuY2FsbChwaWNrZXIsIHdpZGdldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBrZXl1cCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBrZXlTdGF0ZVtlLndoaWNoXSA9ICdyJztcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBjaGFuZ2UgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9ICQoZS50YXJnZXQpLnZhbCgpLnRyaW0oKSxcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZWREYXRlID0gdmFsID8gcGFyc2VJbnB1dERhdGUodmFsKSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZShwYXJzZWREYXRlKTtcclxuICAgICAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBhdHRhY2hEYXRlUGlja2VyRWxlbWVudEV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0Lm9uKHtcclxuICAgICAgICAgICAgICAgICAgICAnY2hhbmdlJzogY2hhbmdlLFxyXG4gICAgICAgICAgICAgICAgICAgICdibHVyJzogb3B0aW9ucy5kZWJ1ZyA/ICcnIDogaGlkZSxcclxuICAgICAgICAgICAgICAgICAgICAna2V5ZG93bic6IGtleWRvd24sXHJcbiAgICAgICAgICAgICAgICAgICAgJ2tleXVwJzoga2V5dXAsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2ZvY3VzJzogb3B0aW9ucy5hbGxvd0lucHV0VG9nZ2xlID8gc2hvdyA6ICcnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5pcygnaW5wdXQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Lm9uKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ZvY3VzJzogc2hvd1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQub24oJ2NsaWNrJywgdG9nZ2xlKTtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQub24oJ21vdXNlZG93bicsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGRldGFjaERhdGVQaWNrZXJFbGVtZW50RXZlbnRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaW5wdXQub2ZmKHtcclxuICAgICAgICAgICAgICAgICAgICAnY2hhbmdlJzogY2hhbmdlLFxyXG4gICAgICAgICAgICAgICAgICAgICdibHVyJzogYmx1cixcclxuICAgICAgICAgICAgICAgICAgICAna2V5ZG93bic6IGtleWRvd24sXHJcbiAgICAgICAgICAgICAgICAgICAgJ2tleXVwJzoga2V5dXAsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2ZvY3VzJzogb3B0aW9ucy5hbGxvd0lucHV0VG9nZ2xlID8gaGlkZSA6ICcnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5pcygnaW5wdXQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Lm9mZih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdmb2N1cyc6IHNob3dcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50Lm9mZignY2xpY2snLCB0b2dnbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5vZmYoJ21vdXNlZG93bicsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGluZGV4R2l2ZW5EYXRlcyA9IGZ1bmN0aW9uIChnaXZlbkRhdGVzQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgIC8vIFN0b3JlIGdpdmVuIGVuYWJsZWREYXRlcyBhbmQgZGlzYWJsZWREYXRlcyBhcyBrZXlzLlxyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyB3YXkgd2UgY2FuIGNoZWNrIHRoZWlyIGV4aXN0ZW5jZSBpbiBPKDEpIHRpbWUgaW5zdGVhZCBvZiBsb29waW5nIHRocm91Z2ggd2hvbGUgYXJyYXkuXHJcbiAgICAgICAgICAgICAgICAvLyAoZm9yIGV4YW1wbGU6IG9wdGlvbnMuZW5hYmxlZERhdGVzWycyMDE0LTAyLTI3J10gPT09IHRydWUpXHJcbiAgICAgICAgICAgICAgICB2YXIgZ2l2ZW5EYXRlc0luZGV4ZWQgPSB7fTtcclxuICAgICAgICAgICAgICAgICQuZWFjaChnaXZlbkRhdGVzQXJyYXksIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZERhdGUgPSBwYXJzZUlucHV0RGF0ZSh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZERhdGUuaXNWYWxpZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdpdmVuRGF0ZXNJbmRleGVkW2REYXRlLmZvcm1hdCgnWVlZWS1NTS1ERCcpXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKE9iamVjdC5rZXlzKGdpdmVuRGF0ZXNJbmRleGVkKS5sZW5ndGgpID8gZ2l2ZW5EYXRlc0luZGV4ZWQgOiBmYWxzZTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGluZGV4R2l2ZW5Ib3VycyA9IGZ1bmN0aW9uIChnaXZlbkhvdXJzQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgIC8vIFN0b3JlIGdpdmVuIGVuYWJsZWRIb3VycyBhbmQgZGlzYWJsZWRIb3VycyBhcyBrZXlzLlxyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyB3YXkgd2UgY2FuIGNoZWNrIHRoZWlyIGV4aXN0ZW5jZSBpbiBPKDEpIHRpbWUgaW5zdGVhZCBvZiBsb29waW5nIHRocm91Z2ggd2hvbGUgYXJyYXkuXHJcbiAgICAgICAgICAgICAgICAvLyAoZm9yIGV4YW1wbGU6IG9wdGlvbnMuZW5hYmxlZEhvdXJzWycyMDE0LTAyLTI3J10gPT09IHRydWUpXHJcbiAgICAgICAgICAgICAgICB2YXIgZ2l2ZW5Ib3Vyc0luZGV4ZWQgPSB7fTtcclxuICAgICAgICAgICAgICAgICQuZWFjaChnaXZlbkhvdXJzQXJyYXksIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBnaXZlbkhvdXJzSW5kZXhlZFt0aGlzXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoT2JqZWN0LmtleXMoZ2l2ZW5Ib3Vyc0luZGV4ZWQpLmxlbmd0aCkgPyBnaXZlbkhvdXJzSW5kZXhlZCA6IGZhbHNlO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaW5pdEZvcm1hdHRpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZm9ybWF0ID0gb3B0aW9ucy5mb3JtYXQgfHwgJ0wgTFQnO1xyXG5cclxuICAgICAgICAgICAgICAgIGFjdHVhbEZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKC8oXFxbW15cXFtdKlxcXSl8KFxcXFwpPyhMVFN8TFR8TEw/TD9MP3xsezEsNH0pL2csIGZ1bmN0aW9uIChmb3JtYXRJbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdpbnB1dCA9IGRhdGUubG9jYWxlRGF0YSgpLmxvbmdEYXRlRm9ybWF0KGZvcm1hdElucHV0KSB8fCBmb3JtYXRJbnB1dDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3aW5wdXQucmVwbGFjZSgvKFxcW1teXFxbXSpcXF0pfChcXFxcKT8oTFRTfExUfExMP0w/TD98bHsxLDR9KS9nLCBmdW5jdGlvbiAoZm9ybWF0SW5wdXQyKSB7IC8vdGVtcCBmaXggZm9yICM3NDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGUubG9jYWxlRGF0YSgpLmxvbmdEYXRlRm9ybWF0KGZvcm1hdElucHV0MikgfHwgZm9ybWF0SW5wdXQyO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIHBhcnNlRm9ybWF0cyA9IG9wdGlvbnMuZXh0cmFGb3JtYXRzID8gb3B0aW9ucy5leHRyYUZvcm1hdHMuc2xpY2UoKSA6IFtdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlRm9ybWF0cy5pbmRleE9mKGZvcm1hdCkgPCAwICYmIHBhcnNlRm9ybWF0cy5pbmRleE9mKGFjdHVhbEZvcm1hdCkgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VGb3JtYXRzLnB1c2goYWN0dWFsRm9ybWF0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB1c2UyNEhvdXJzID0gKGFjdHVhbEZvcm1hdC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2EnKSA8IDEgJiYgYWN0dWFsRm9ybWF0LnJlcGxhY2UoL1xcWy4qP1xcXS9nLCAnJykuaW5kZXhPZignaCcpIDwgMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzRW5hYmxlZCgneScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWluVmlld01vZGVOdW1iZXIgPSAyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGlzRW5hYmxlZCgnTScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWluVmlld01vZGVOdW1iZXIgPSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGlzRW5hYmxlZCgnZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWluVmlld01vZGVOdW1iZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGN1cnJlbnRWaWV3TW9kZSA9IE1hdGgubWF4KG1pblZpZXdNb2RlTnVtYmVyLCBjdXJyZW50Vmlld01vZGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghdW5zZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZShkYXRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBQdWJsaWMgQVBJIGZ1bmN0aW9uc1xyXG4gICAgICAgICAqID09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogSW1wb3J0YW50OiBEbyBub3QgZXhwb3NlIGRpcmVjdCByZWZlcmVuY2VzIHRvIHByaXZhdGUgb2JqZWN0cyBvciB0aGUgb3B0aW9uc1xyXG4gICAgICAgICAqIG9iamVjdCB0byB0aGUgb3V0ZXIgd29ybGQuIEFsd2F5cyByZXR1cm4gYSBjbG9uZSB3aGVuIHJldHVybmluZyB2YWx1ZXMgb3IgbWFrZVxyXG4gICAgICAgICAqIGEgY2xvbmUgd2hlbiBzZXR0aW5nIGEgcHJpdmF0ZSB2YXJpYWJsZS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgICAgICBwaWNrZXIuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8vPHN1bW1hcnk+RGVzdHJveXMgdGhlIHdpZGdldCBhbmQgcmVtb3ZlcyBhbGwgYXR0YWNoZWQgZXZlbnQgbGlzdGVuZXJzPC9zdW1tYXJ5PlxyXG4gICAgICAgICAgICBoaWRlKCk7XHJcbiAgICAgICAgICAgIGRldGFjaERhdGVQaWNrZXJFbGVtZW50RXZlbnRzKCk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRGF0YSgnRGF0ZVRpbWVQaWNrZXInKTtcclxuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVEYXRhKCdkYXRlJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGlja2VyLnRvZ2dsZSA9IHRvZ2dsZTtcclxuXHJcbiAgICAgICAgcGlja2VyLnNob3cgPSBzaG93O1xyXG5cclxuICAgICAgICBwaWNrZXIuaGlkZSA9IGhpZGU7XHJcblxyXG4gICAgICAgIHBpY2tlci5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLy88c3VtbWFyeT5EaXNhYmxlcyB0aGUgaW5wdXQgZWxlbWVudCwgdGhlIGNvbXBvbmVudCBpcyBhdHRhY2hlZCB0bywgYnkgYWRkaW5nIGEgZGlzYWJsZWQ9XCJ0cnVlXCIgYXR0cmlidXRlIHRvIGl0LlxyXG4gICAgICAgICAgICAvLy9JZiB0aGUgd2lkZ2V0IHdhcyB2aXNpYmxlIGJlZm9yZSB0aGF0IGNhbGwgaXQgaXMgaGlkZGVuLiBQb3NzaWJseSBlbWl0cyBkcC5oaWRlPC9zdW1tYXJ5PlxyXG4gICAgICAgICAgICBoaWRlKCk7XHJcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQgJiYgY29tcG9uZW50Lmhhc0NsYXNzKCdidG4nKSkge1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlucHV0LnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGlja2VyLmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8vPHN1bW1hcnk+RW5hYmxlcyB0aGUgaW5wdXQgZWxlbWVudCwgdGhlIGNvbXBvbmVudCBpcyBhdHRhY2hlZCB0bywgYnkgcmVtb3ZpbmcgZGlzYWJsZWQgYXR0cmlidXRlIGZyb20gaXQuPC9zdW1tYXJ5PlxyXG4gICAgICAgICAgICBpZiAoY29tcG9uZW50ICYmIGNvbXBvbmVudC5oYXNDbGFzcygnYnRuJykpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbnB1dC5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwaWNrZXIuaWdub3JlUmVhZG9ubHkgPSBmdW5jdGlvbiAoaWdub3JlUmVhZG9ubHkpIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmlnbm9yZVJlYWRvbmx5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaWdub3JlUmVhZG9ubHkgIT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaWdub3JlUmVhZG9ubHkgKCkgZXhwZWN0cyBhIGJvb2xlYW4gcGFyYW1ldGVyJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3B0aW9ucy5pZ25vcmVSZWFkb25seSA9IGlnbm9yZVJlYWRvbmx5O1xyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci5vcHRpb25zID0gZnVuY3Rpb24gKG5ld09wdGlvbnMpIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkLmV4dGVuZCh0cnVlLCB7fSwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghKG5ld09wdGlvbnMgaW5zdGFuY2VvZiBPYmplY3QpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zKCkgb3B0aW9ucyBwYXJhbWV0ZXIgc2hvdWxkIGJlIGFuIG9iamVjdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICQuZXh0ZW5kKHRydWUsIG9wdGlvbnMsIG5ld09wdGlvbnMpO1xyXG4gICAgICAgICAgICAkLmVhY2gob3B0aW9ucywgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwaWNrZXJba2V5XSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGlja2VyW2tleV0odmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gJyArIGtleSArICcgaXMgbm90IHJlY29nbml6ZWQhJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci5kYXRlID0gZnVuY3Rpb24gKG5ld0RhdGUpIHtcclxuICAgICAgICAgICAgLy8vPHNpZ25hdHVyZSBoZWxwS2V5d29yZD1cIiQuZm4uZGF0ZXRpbWVwaWNrZXIuZGF0ZVwiPlxyXG4gICAgICAgICAgICAvLy88c3VtbWFyeT5SZXR1cm5zIHRoZSBjb21wb25lbnQncyBtb2RlbCBjdXJyZW50IGRhdGUsIGEgbW9tZW50IG9iamVjdCBvciBudWxsIGlmIG5vdCBzZXQuPC9zdW1tYXJ5PlxyXG4gICAgICAgICAgICAvLy88cmV0dXJucyB0eXBlPVwiTW9tZW50XCI+ZGF0ZS5jbG9uZSgpPC9yZXR1cm5zPlxyXG4gICAgICAgICAgICAvLy88L3NpZ25hdHVyZT5cclxuICAgICAgICAgICAgLy8vPHNpZ25hdHVyZT5cclxuICAgICAgICAgICAgLy8vPHN1bW1hcnk+U2V0cyB0aGUgY29tcG9uZW50cyBtb2RlbCBjdXJyZW50IG1vbWVudCB0byBpdC4gUGFzc2luZyBhIG51bGwgdmFsdWUgdW5zZXRzIHRoZSBjb21wb25lbnRzIG1vZGVsIGN1cnJlbnQgbW9tZW50LiBQYXJzaW5nIG9mIHRoZSBuZXdEYXRlIHBhcmFtZXRlciBpcyBtYWRlIHVzaW5nIG1vbWVudCBsaWJyYXJ5IHdpdGggdGhlIG9wdGlvbnMuZm9ybWF0IGFuZCBvcHRpb25zLnVzZVN0cmljdCBjb21wb25lbnRzIGNvbmZpZ3VyYXRpb24uPC9zdW1tYXJ5PlxyXG4gICAgICAgICAgICAvLy88cGFyYW0gbmFtZT1cIm5ld0RhdGVcIiBsb2NpZD1cIiQuZm4uZGF0ZXRpbWVwaWNrZXIuZGF0ZV9wOm5ld0RhdGVcIj5UYWtlcyBzdHJpbmcsIERhdGUsIG1vbWVudCwgbnVsbCBwYXJhbWV0ZXIuPC9wYXJhbT5cclxuICAgICAgICAgICAgLy8vPC9zaWduYXR1cmU+XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodW5zZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlLmNsb25lKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChuZXdEYXRlICE9PSBudWxsICYmIHR5cGVvZiBuZXdEYXRlICE9PSAnc3RyaW5nJyAmJiAhbW9tZW50LmlzTW9tZW50KG5ld0RhdGUpICYmICEobmV3RGF0ZSBpbnN0YW5jZW9mIERhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdkYXRlKCkgcGFyYW1ldGVyIG11c3QgYmUgb25lIG9mIFtudWxsLCBzdHJpbmcsIG1vbWVudCBvciBEYXRlXScpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzZXRWYWx1ZShuZXdEYXRlID09PSBudWxsID8gbnVsbCA6IHBhcnNlSW5wdXREYXRlKG5ld0RhdGUpKTtcclxuICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwaWNrZXIuZm9ybWF0ID0gZnVuY3Rpb24gKG5ld0Zvcm1hdCkge1xyXG4gICAgICAgICAgICAvLy88c3VtbWFyeT50ZXN0IHN1PC9zdW1tYXJ5PlxyXG4gICAgICAgICAgICAvLy88cGFyYW0gbmFtZT1cIm5ld0Zvcm1hdFwiPmluZm8gYWJvdXQgcGFyYTwvcGFyYW0+XHJcbiAgICAgICAgICAgIC8vLzxyZXR1cm5zIHR5cGU9XCJzdHJpbmd8Ym9vbGVhblwiPnJldHVybnMgZm9vPC9yZXR1cm5zPlxyXG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm9ybWF0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoKHR5cGVvZiBuZXdGb3JtYXQgIT09ICdzdHJpbmcnKSAmJiAoKHR5cGVvZiBuZXdGb3JtYXQgIT09ICdib29sZWFuJykgfHwgKG5ld0Zvcm1hdCAhPT0gZmFsc2UpKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZm9ybWF0KCkgZXhwZWN0cyBhIHN0cmluZyBvciBib29sZWFuOmZhbHNlIHBhcmFtZXRlciAnICsgbmV3Rm9ybWF0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy5mb3JtYXQgPSBuZXdGb3JtYXQ7XHJcbiAgICAgICAgICAgIGlmIChhY3R1YWxGb3JtYXQpIHtcclxuICAgICAgICAgICAgICAgIGluaXRGb3JtYXR0aW5nKCk7IC8vIHJlaW5pdCBmb3JtYXR0aW5nXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwaWNrZXIudGltZVpvbmUgPSBmdW5jdGlvbiAobmV3Wm9uZSkge1xyXG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMudGltZVpvbmU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbmV3Wm9uZSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ25ld1pvbmUoKSBleHBlY3RzIGEgc3RyaW5nIHBhcmFtZXRlcicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLnRpbWVab25lID0gbmV3Wm9uZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGlja2VyLmRheVZpZXdIZWFkZXJGb3JtYXQgPSBmdW5jdGlvbiAobmV3Rm9ybWF0KSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5kYXlWaWV3SGVhZGVyRm9ybWF0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG5ld0Zvcm1hdCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2RheVZpZXdIZWFkZXJGb3JtYXQoKSBleHBlY3RzIGEgc3RyaW5nIHBhcmFtZXRlcicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLmRheVZpZXdIZWFkZXJGb3JtYXQgPSBuZXdGb3JtYXQ7XHJcbiAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGlja2VyLmV4dHJhRm9ybWF0cyA9IGZ1bmN0aW9uIChmb3JtYXRzKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5leHRyYUZvcm1hdHM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChmb3JtYXRzICE9PSBmYWxzZSAmJiAhKGZvcm1hdHMgaW5zdGFuY2VvZiBBcnJheSkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4dHJhRm9ybWF0cygpIGV4cGVjdHMgYW4gYXJyYXkgb3IgZmFsc2UgcGFyYW1ldGVyJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG9wdGlvbnMuZXh0cmFGb3JtYXRzID0gZm9ybWF0cztcclxuICAgICAgICAgICAgaWYgKHBhcnNlRm9ybWF0cykge1xyXG4gICAgICAgICAgICAgICAgaW5pdEZvcm1hdHRpbmcoKTsgLy8gcmVpbml0IGZvcm1hdHRpbmdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci5kaXNhYmxlZERhdGVzID0gZnVuY3Rpb24gKGRhdGVzKSB7XHJcbiAgICAgICAgICAgIC8vLzxzaWduYXR1cmUgaGVscEtleXdvcmQ9XCIkLmZuLmRhdGV0aW1lcGlja2VyLmRpc2FibGVkRGF0ZXNcIj5cclxuICAgICAgICAgICAgLy8vPHN1bW1hcnk+UmV0dXJucyBhbiBhcnJheSB3aXRoIHRoZSBjdXJyZW50bHkgc2V0IGRpc2FibGVkIGRhdGVzIG9uIHRoZSBjb21wb25lbnQuPC9zdW1tYXJ5PlxyXG4gICAgICAgICAgICAvLy88cmV0dXJucyB0eXBlPVwiYXJyYXlcIj5vcHRpb25zLmRpc2FibGVkRGF0ZXM8L3JldHVybnM+XHJcbiAgICAgICAgICAgIC8vLzwvc2lnbmF0dXJlPlxyXG4gICAgICAgICAgICAvLy88c2lnbmF0dXJlPlxyXG4gICAgICAgICAgICAvLy88c3VtbWFyeT5TZXR0aW5nIHRoaXMgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIG9wdGlvbnMubWluRGF0ZSwgb3B0aW9ucy5tYXhEYXRlIGNvbmZpZ3VyYXRpb24uIEFsc28gY2FsbGluZyB0aGlzIGZ1bmN0aW9uIHJlbW92ZXMgdGhlIGNvbmZpZ3VyYXRpb24gb2ZcclxuICAgICAgICAgICAgLy8vb3B0aW9ucy5lbmFibGVkRGF0ZXMgaWYgc3VjaCBleGlzdC48L3N1bW1hcnk+XHJcbiAgICAgICAgICAgIC8vLzxwYXJhbSBuYW1lPVwiZGF0ZXNcIiBsb2NpZD1cIiQuZm4uZGF0ZXRpbWVwaWNrZXIuZGlzYWJsZWREYXRlc19wOmRhdGVzXCI+VGFrZXMgYW4gWyBzdHJpbmcgb3IgRGF0ZSBvciBtb21lbnQgXSBvZiB2YWx1ZXMgYW5kIGFsbG93cyB0aGUgdXNlciB0byBzZWxlY3Qgb25seSBmcm9tIHRob3NlIGRheXMuPC9wYXJhbT5cclxuICAgICAgICAgICAgLy8vPC9zaWduYXR1cmU+XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKG9wdGlvbnMuZGlzYWJsZWREYXRlcyA/ICQuZXh0ZW5kKHt9LCBvcHRpb25zLmRpc2FibGVkRGF0ZXMpIDogb3B0aW9ucy5kaXNhYmxlZERhdGVzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFkYXRlcykge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5kaXNhYmxlZERhdGVzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCEoZGF0ZXMgaW5zdGFuY2VvZiBBcnJheSkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2Rpc2FibGVkRGF0ZXMoKSBleHBlY3RzIGFuIGFycmF5IHBhcmFtZXRlcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wdGlvbnMuZGlzYWJsZWREYXRlcyA9IGluZGV4R2l2ZW5EYXRlcyhkYXRlcyk7XHJcbiAgICAgICAgICAgIG9wdGlvbnMuZW5hYmxlZERhdGVzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHVwZGF0ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci5lbmFibGVkRGF0ZXMgPSBmdW5jdGlvbiAoZGF0ZXMpIHtcclxuICAgICAgICAgICAgLy8vPHNpZ25hdHVyZSBoZWxwS2V5d29yZD1cIiQuZm4uZGF0ZXRpbWVwaWNrZXIuZW5hYmxlZERhdGVzXCI+XHJcbiAgICAgICAgICAgIC8vLzxzdW1tYXJ5PlJldHVybnMgYW4gYXJyYXkgd2l0aCB0aGUgY3VycmVudGx5IHNldCBlbmFibGVkIGRhdGVzIG9uIHRoZSBjb21wb25lbnQuPC9zdW1tYXJ5PlxyXG4gICAgICAgICAgICAvLy88cmV0dXJucyB0eXBlPVwiYXJyYXlcIj5vcHRpb25zLmVuYWJsZWREYXRlczwvcmV0dXJucz5cclxuICAgICAgICAgICAgLy8vPC9zaWduYXR1cmU+XHJcbiAgICAgICAgICAgIC8vLzxzaWduYXR1cmU+XHJcbiAgICAgICAgICAgIC8vLzxzdW1tYXJ5PlNldHRpbmcgdGhpcyB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgb3B0aW9ucy5taW5EYXRlLCBvcHRpb25zLm1heERhdGUgY29uZmlndXJhdGlvbi4gQWxzbyBjYWxsaW5nIHRoaXMgZnVuY3Rpb24gcmVtb3ZlcyB0aGUgY29uZmlndXJhdGlvbiBvZiBvcHRpb25zLmRpc2FibGVkRGF0ZXMgaWYgc3VjaCBleGlzdC48L3N1bW1hcnk+XHJcbiAgICAgICAgICAgIC8vLzxwYXJhbSBuYW1lPVwiZGF0ZXNcIiBsb2NpZD1cIiQuZm4uZGF0ZXRpbWVwaWNrZXIuZW5hYmxlZERhdGVzX3A6ZGF0ZXNcIj5UYWtlcyBhbiBbIHN0cmluZyBvciBEYXRlIG9yIG1vbWVudCBdIG9mIHZhbHVlcyBhbmQgYWxsb3dzIHRoZSB1c2VyIHRvIHNlbGVjdCBvbmx5IGZyb20gdGhvc2UgZGF5cy48L3BhcmFtPlxyXG4gICAgICAgICAgICAvLy88L3NpZ25hdHVyZT5cclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAob3B0aW9ucy5lbmFibGVkRGF0ZXMgPyAkLmV4dGVuZCh7fSwgb3B0aW9ucy5lbmFibGVkRGF0ZXMpIDogb3B0aW9ucy5lbmFibGVkRGF0ZXMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIWRhdGVzKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmVuYWJsZWREYXRlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghKGRhdGVzIGluc3RhbmNlb2YgQXJyYXkpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdlbmFibGVkRGF0ZXMoKSBleHBlY3RzIGFuIGFycmF5IHBhcmFtZXRlcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wdGlvbnMuZW5hYmxlZERhdGVzID0gaW5kZXhHaXZlbkRhdGVzKGRhdGVzKTtcclxuICAgICAgICAgICAgb3B0aW9ucy5kaXNhYmxlZERhdGVzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHVwZGF0ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci5kYXlzT2ZXZWVrRGlzYWJsZWQgPSBmdW5jdGlvbiAoZGF5c09mV2Vla0Rpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5kYXlzT2ZXZWVrRGlzYWJsZWQuc3BsaWNlKDApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoKHR5cGVvZiBkYXlzT2ZXZWVrRGlzYWJsZWQgPT09ICdib29sZWFuJykgJiYgIWRheXNPZldlZWtEaXNhYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5kYXlzT2ZXZWVrRGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCEoZGF5c09mV2Vla0Rpc2FibGVkIGluc3RhbmNlb2YgQXJyYXkpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdkYXlzT2ZXZWVrRGlzYWJsZWQoKSBleHBlY3RzIGFuIGFycmF5IHBhcmFtZXRlcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wdGlvbnMuZGF5c09mV2Vla0Rpc2FibGVkID0gZGF5c09mV2Vla0Rpc2FibGVkLnJlZHVjZShmdW5jdGlvbiAocHJldmlvdXNWYWx1ZSwgY3VycmVudFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUgPSBwYXJzZUludChjdXJyZW50VmFsdWUsIDEwKTtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50VmFsdWUgPiA2IHx8IGN1cnJlbnRWYWx1ZSA8IDAgfHwgaXNOYU4oY3VycmVudFZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2aW91c1ZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzVmFsdWUuaW5kZXhPZihjdXJyZW50VmFsdWUpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzVmFsdWUucHVzaChjdXJyZW50VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzVmFsdWU7XHJcbiAgICAgICAgICAgIH0sIFtdKS5zb3J0KCk7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnVzZUN1cnJlbnQgJiYgIW9wdGlvbnMua2VlcEludmFsaWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0cmllcyA9IDA7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWlzVmFsaWQoZGF0ZSwgJ2QnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGUuYWRkKDEsICdkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyaWVzID09PSAzMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyAnVHJpZWQgMzEgdGltZXMgdG8gZmluZCBhIHZhbGlkIGRhdGUnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0cmllcysrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUoZGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGlja2VyLm1heERhdGUgPSBmdW5jdGlvbiAobWF4RGF0ZSkge1xyXG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMubWF4RGF0ZSA/IG9wdGlvbnMubWF4RGF0ZS5jbG9uZSgpIDogb3B0aW9ucy5tYXhEYXRlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoKHR5cGVvZiBtYXhEYXRlID09PSAnYm9vbGVhbicpICYmIG1heERhdGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLm1heERhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBtYXhEYXRlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1heERhdGUgPT09ICdub3cnIHx8IG1heERhdGUgPT09ICdtb21lbnQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4RGF0ZSA9IGdldE1vbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgcGFyc2VkRGF0ZSA9IHBhcnNlSW5wdXREYXRlKG1heERhdGUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFwYXJzZWREYXRlLmlzVmFsaWQoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbWF4RGF0ZSgpIENvdWxkIG5vdCBwYXJzZSBkYXRlIHBhcmFtZXRlcjogJyArIG1heERhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm1pbkRhdGUgJiYgcGFyc2VkRGF0ZS5pc0JlZm9yZShvcHRpb25zLm1pbkRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtYXhEYXRlKCkgZGF0ZSBwYXJhbWV0ZXIgaXMgYmVmb3JlIG9wdGlvbnMubWluRGF0ZTogJyArIHBhcnNlZERhdGUuZm9ybWF0KGFjdHVhbEZvcm1hdCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wdGlvbnMubWF4RGF0ZSA9IHBhcnNlZERhdGU7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnVzZUN1cnJlbnQgJiYgIW9wdGlvbnMua2VlcEludmFsaWQgJiYgZGF0ZS5pc0FmdGVyKG1heERhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZShvcHRpb25zLm1heERhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh2aWV3RGF0ZS5pc0FmdGVyKHBhcnNlZERhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3RGF0ZSA9IHBhcnNlZERhdGUuY2xvbmUoKS5zdWJ0cmFjdChvcHRpb25zLnN0ZXBwaW5nLCAnbScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHVwZGF0ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci5taW5EYXRlID0gZnVuY3Rpb24gKG1pbkRhdGUpIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLm1pbkRhdGUgPyBvcHRpb25zLm1pbkRhdGUuY2xvbmUoKSA6IG9wdGlvbnMubWluRGF0ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCh0eXBlb2YgbWluRGF0ZSA9PT0gJ2Jvb2xlYW4nKSAmJiBtaW5EYXRlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5taW5EYXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbWluRGF0ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtaW5EYXRlID09PSAnbm93JyB8fCBtaW5EYXRlID09PSAnbW9tZW50Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbkRhdGUgPSBnZXRNb21lbnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHBhcnNlZERhdGUgPSBwYXJzZUlucHV0RGF0ZShtaW5EYXRlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghcGFyc2VkRGF0ZS5pc1ZhbGlkKCkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ21pbkRhdGUoKSBDb3VsZCBub3QgcGFyc2UgZGF0ZSBwYXJhbWV0ZXI6ICcgKyBtaW5EYXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5tYXhEYXRlICYmIHBhcnNlZERhdGUuaXNBZnRlcihvcHRpb25zLm1heERhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtaW5EYXRlKCkgZGF0ZSBwYXJhbWV0ZXIgaXMgYWZ0ZXIgb3B0aW9ucy5tYXhEYXRlOiAnICsgcGFyc2VkRGF0ZS5mb3JtYXQoYWN0dWFsRm9ybWF0KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3B0aW9ucy5taW5EYXRlID0gcGFyc2VkRGF0ZTtcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudXNlQ3VycmVudCAmJiAhb3B0aW9ucy5rZWVwSW52YWxpZCAmJiBkYXRlLmlzQmVmb3JlKG1pbkRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZShvcHRpb25zLm1pbkRhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh2aWV3RGF0ZS5pc0JlZm9yZShwYXJzZWREYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgdmlld0RhdGUgPSBwYXJzZWREYXRlLmNsb25lKCkuYWRkKG9wdGlvbnMuc3RlcHBpbmcsICdtJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGlja2VyLmRlZmF1bHREYXRlID0gZnVuY3Rpb24gKGRlZmF1bHREYXRlKSB7XHJcbiAgICAgICAgICAgIC8vLzxzaWduYXR1cmUgaGVscEtleXdvcmQ9XCIkLmZuLmRhdGV0aW1lcGlja2VyLmRlZmF1bHREYXRlXCI+XHJcbiAgICAgICAgICAgIC8vLzxzdW1tYXJ5PlJldHVybnMgYSBtb21lbnQgd2l0aCB0aGUgb3B0aW9ucy5kZWZhdWx0RGF0ZSBvcHRpb24gY29uZmlndXJhdGlvbiBvciBmYWxzZSBpZiBub3Qgc2V0PC9zdW1tYXJ5PlxyXG4gICAgICAgICAgICAvLy88cmV0dXJucyB0eXBlPVwiTW9tZW50XCI+ZGF0ZS5jbG9uZSgpPC9yZXR1cm5zPlxyXG4gICAgICAgICAgICAvLy88L3NpZ25hdHVyZT5cclxuICAgICAgICAgICAgLy8vPHNpZ25hdHVyZT5cclxuICAgICAgICAgICAgLy8vPHN1bW1hcnk+V2lsbCBzZXQgdGhlIHBpY2tlcidzIGluaXRhbCBkYXRlLiBJZiBhIGJvb2xlYW46ZmFsc2UgdmFsdWUgaXMgcGFzc2VkIHRoZSBvcHRpb25zLmRlZmF1bHREYXRlIHBhcmFtZXRlciBpcyBjbGVhcmVkLjwvc3VtbWFyeT5cclxuICAgICAgICAgICAgLy8vPHBhcmFtIG5hbWU9XCJkZWZhdWx0RGF0ZVwiIGxvY2lkPVwiJC5mbi5kYXRldGltZXBpY2tlci5kZWZhdWx0RGF0ZV9wOmRlZmF1bHREYXRlXCI+VGFrZXMgYSBzdHJpbmcsIERhdGUsIG1vbWVudCwgYm9vbGVhbjpmYWxzZTwvcGFyYW0+XHJcbiAgICAgICAgICAgIC8vLzwvc2lnbmF0dXJlPlxyXG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZGVmYXVsdERhdGUgPyBvcHRpb25zLmRlZmF1bHREYXRlLmNsb25lKCkgOiBvcHRpb25zLmRlZmF1bHREYXRlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZGVmYXVsdERhdGUpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMuZGVmYXVsdERhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZGVmYXVsdERhdGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVmYXVsdERhdGUgPT09ICdub3cnIHx8IGRlZmF1bHREYXRlID09PSAnbW9tZW50Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHREYXRlID0gZ2V0TW9tZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHREYXRlID0gZ2V0TW9tZW50KGRlZmF1bHREYXRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHBhcnNlZERhdGUgPSBwYXJzZUlucHV0RGF0ZShkZWZhdWx0RGF0ZSk7XHJcbiAgICAgICAgICAgIGlmICghcGFyc2VkRGF0ZS5pc1ZhbGlkKCkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2RlZmF1bHREYXRlKCkgQ291bGQgbm90IHBhcnNlIGRhdGUgcGFyYW1ldGVyOiAnICsgZGVmYXVsdERhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghaXNWYWxpZChwYXJzZWREYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZGVmYXVsdERhdGUoKSBkYXRlIHBhc3NlZCBpcyBpbnZhbGlkIGFjY29yZGluZyB0byBjb21wb25lbnQgc2V0dXAgdmFsaWRhdGlvbnMnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy5kZWZhdWx0RGF0ZSA9IHBhcnNlZERhdGU7XHJcblxyXG4gICAgICAgICAgICBpZiAoKG9wdGlvbnMuZGVmYXVsdERhdGUgJiYgb3B0aW9ucy5pbmxpbmUpIHx8IGlucHV0LnZhbCgpLnRyaW0oKSA9PT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHNldFZhbHVlKG9wdGlvbnMuZGVmYXVsdERhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGlja2VyLmxvY2FsZSA9IGZ1bmN0aW9uIChsb2NhbGUpIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmxvY2FsZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFtb21lbnQubG9jYWxlRGF0YShsb2NhbGUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdsb2NhbGUoKSBsb2NhbGUgJyArIGxvY2FsZSArICcgaXMgbm90IGxvYWRlZCBmcm9tIG1vbWVudCBsb2NhbGVzIScpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLmxvY2FsZSA9IGxvY2FsZTtcclxuICAgICAgICAgICAgZGF0ZS5sb2NhbGUob3B0aW9ucy5sb2NhbGUpO1xyXG4gICAgICAgICAgICB2aWV3RGF0ZS5sb2NhbGUob3B0aW9ucy5sb2NhbGUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGFjdHVhbEZvcm1hdCkge1xyXG4gICAgICAgICAgICAgICAgaW5pdEZvcm1hdHRpbmcoKTsgLy8gcmVpbml0IGZvcm1hdHRpbmdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAod2lkZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBoaWRlKCk7XHJcbiAgICAgICAgICAgICAgICBzaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwaWNrZXIuc3RlcHBpbmcgPSBmdW5jdGlvbiAoc3RlcHBpbmcpIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLnN0ZXBwaW5nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzdGVwcGluZyA9IHBhcnNlSW50KHN0ZXBwaW5nLCAxMCk7XHJcbiAgICAgICAgICAgIGlmIChpc05hTihzdGVwcGluZykgfHwgc3RlcHBpbmcgPCAxKSB7XHJcbiAgICAgICAgICAgICAgICBzdGVwcGluZyA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3B0aW9ucy5zdGVwcGluZyA9IHN0ZXBwaW5nO1xyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci51c2VDdXJyZW50ID0gZnVuY3Rpb24gKHVzZUN1cnJlbnQpIHtcclxuICAgICAgICAgICAgdmFyIHVzZUN1cnJlbnRPcHRpb25zID0gWyd5ZWFyJywgJ21vbnRoJywgJ2RheScsICdob3VyJywgJ21pbnV0ZSddO1xyXG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMudXNlQ3VycmVudDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCh0eXBlb2YgdXNlQ3VycmVudCAhPT0gJ2Jvb2xlYW4nKSAmJiAodHlwZW9mIHVzZUN1cnJlbnQgIT09ICdzdHJpbmcnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndXNlQ3VycmVudCgpIGV4cGVjdHMgYSBib29sZWFuIG9yIHN0cmluZyBwYXJhbWV0ZXInKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHVzZUN1cnJlbnQgPT09ICdzdHJpbmcnICYmIHVzZUN1cnJlbnRPcHRpb25zLmluZGV4T2YodXNlQ3VycmVudC50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3VzZUN1cnJlbnQoKSBleHBlY3RzIGEgc3RyaW5nIHBhcmFtZXRlciBvZiAnICsgdXNlQ3VycmVudE9wdGlvbnMuam9pbignLCAnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3B0aW9ucy51c2VDdXJyZW50ID0gdXNlQ3VycmVudDtcclxuICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwaWNrZXIuY29sbGFwc2UgPSBmdW5jdGlvbiAoY29sbGFwc2UpIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmNvbGxhcHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNvbGxhcHNlICE9PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2NvbGxhcHNlKCkgZXhwZWN0cyBhIGJvb2xlYW4gcGFyYW1ldGVyJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuY29sbGFwc2UgPT09IGNvbGxhcHNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wdGlvbnMuY29sbGFwc2UgPSBjb2xsYXBzZTtcclxuICAgICAgICAgICAgaWYgKHdpZGdldCkge1xyXG4gICAgICAgICAgICAgICAgaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGlja2VyLmljb25zID0gZnVuY3Rpb24gKGljb25zKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJC5leHRlbmQoe30sIG9wdGlvbnMuaWNvbnMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIShpY29ucyBpbnN0YW5jZW9mIE9iamVjdCkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2ljb25zKCkgZXhwZWN0cyBwYXJhbWV0ZXIgdG8gYmUgYW4gT2JqZWN0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJC5leHRlbmQob3B0aW9ucy5pY29ucywgaWNvbnMpO1xyXG4gICAgICAgICAgICBpZiAod2lkZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBoaWRlKCk7XHJcbiAgICAgICAgICAgICAgICBzaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwaWNrZXIudG9vbHRpcHMgPSBmdW5jdGlvbiAodG9vbHRpcHMpIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkLmV4dGVuZCh7fSwgb3B0aW9ucy50b29sdGlwcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghKHRvb2x0aXBzIGluc3RhbmNlb2YgT2JqZWN0KSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndG9vbHRpcHMoKSBleHBlY3RzIHBhcmFtZXRlciB0byBiZSBhbiBPYmplY3QnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkLmV4dGVuZChvcHRpb25zLnRvb2x0aXBzLCB0b29sdGlwcyk7XHJcbiAgICAgICAgICAgIGlmICh3aWRnZXQpIHtcclxuICAgICAgICAgICAgICAgIGhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci51c2VTdHJpY3QgPSBmdW5jdGlvbiAodXNlU3RyaWN0KSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy51c2VTdHJpY3Q7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdXNlU3RyaWN0ICE9PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3VzZVN0cmljdCgpIGV4cGVjdHMgYSBib29sZWFuIHBhcmFtZXRlcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wdGlvbnMudXNlU3RyaWN0ID0gdXNlU3RyaWN0O1xyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci5zaWRlQnlTaWRlID0gZnVuY3Rpb24gKHNpZGVCeVNpZGUpIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLnNpZGVCeVNpZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2lkZUJ5U2lkZSAhPT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdzaWRlQnlTaWRlKCkgZXhwZWN0cyBhIGJvb2xlYW4gcGFyYW1ldGVyJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3B0aW9ucy5zaWRlQnlTaWRlID0gc2lkZUJ5U2lkZTtcclxuICAgICAgICAgICAgaWYgKHdpZGdldCkge1xyXG4gICAgICAgICAgICAgICAgaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGlja2VyLnZpZXdNb2RlID0gZnVuY3Rpb24gKHZpZXdNb2RlKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy52aWV3TW9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2aWV3TW9kZSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZpZXdNb2RlKCkgZXhwZWN0cyBhIHN0cmluZyBwYXJhbWV0ZXInKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHZpZXdNb2Rlcy5pbmRleE9mKHZpZXdNb2RlKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZpZXdNb2RlKCkgcGFyYW1ldGVyIG11c3QgYmUgb25lIG9mICgnICsgdmlld01vZGVzLmpvaW4oJywgJykgKyAnKSB2YWx1ZScpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLnZpZXdNb2RlID0gdmlld01vZGU7XHJcbiAgICAgICAgICAgIGN1cnJlbnRWaWV3TW9kZSA9IE1hdGgubWF4KHZpZXdNb2Rlcy5pbmRleE9mKHZpZXdNb2RlKSwgbWluVmlld01vZGVOdW1iZXIpO1xyXG5cclxuICAgICAgICAgICAgc2hvd01vZGUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwaWNrZXIudG9vbGJhclBsYWNlbWVudCA9IGZ1bmN0aW9uICh0b29sYmFyUGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy50b29sYmFyUGxhY2VtZW50O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRvb2xiYXJQbGFjZW1lbnQgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd0b29sYmFyUGxhY2VtZW50KCkgZXhwZWN0cyBhIHN0cmluZyBwYXJhbWV0ZXInKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodG9vbGJhclBsYWNlbWVudHMuaW5kZXhPZih0b29sYmFyUGxhY2VtZW50KSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3Rvb2xiYXJQbGFjZW1lbnQoKSBwYXJhbWV0ZXIgbXVzdCBiZSBvbmUgb2YgKCcgKyB0b29sYmFyUGxhY2VtZW50cy5qb2luKCcsICcpICsgJykgdmFsdWUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcHRpb25zLnRvb2xiYXJQbGFjZW1lbnQgPSB0b29sYmFyUGxhY2VtZW50O1xyXG5cclxuICAgICAgICAgICAgaWYgKHdpZGdldCkge1xyXG4gICAgICAgICAgICAgICAgaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGlja2VyLndpZGdldFBvc2l0aW9uaW5nID0gZnVuY3Rpb24gKHdpZGdldFBvc2l0aW9uaW5nKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJC5leHRlbmQoe30sIG9wdGlvbnMud2lkZ2V0UG9zaXRpb25pbmcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoKHt9KS50b1N0cmluZy5jYWxsKHdpZGdldFBvc2l0aW9uaW5nKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3dpZGdldFBvc2l0aW9uaW5nKCkgZXhwZWN0cyBhbiBvYmplY3QgdmFyaWFibGUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAod2lkZ2V0UG9zaXRpb25pbmcuaG9yaXpvbnRhbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB3aWRnZXRQb3NpdGlvbmluZy5ob3Jpem9udGFsICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3dpZGdldFBvc2l0aW9uaW5nKCkgaG9yaXpvbnRhbCB2YXJpYWJsZSBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aWRnZXRQb3NpdGlvbmluZy5ob3Jpem9udGFsID0gd2lkZ2V0UG9zaXRpb25pbmcuaG9yaXpvbnRhbC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGhvcml6b250YWxNb2Rlcy5pbmRleE9mKHdpZGdldFBvc2l0aW9uaW5nLmhvcml6b250YWwpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3dpZGdldFBvc2l0aW9uaW5nKCkgZXhwZWN0cyBob3Jpem9udGFsIHBhcmFtZXRlciB0byBiZSBvbmUgb2YgKCcgKyBob3Jpem9udGFsTW9kZXMuam9pbignLCAnKSArICcpJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLndpZGdldFBvc2l0aW9uaW5nLmhvcml6b250YWwgPSB3aWRnZXRQb3NpdGlvbmluZy5ob3Jpem9udGFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh3aWRnZXRQb3NpdGlvbmluZy52ZXJ0aWNhbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB3aWRnZXRQb3NpdGlvbmluZy52ZXJ0aWNhbCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd3aWRnZXRQb3NpdGlvbmluZygpIHZlcnRpY2FsIHZhcmlhYmxlIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdpZGdldFBvc2l0aW9uaW5nLnZlcnRpY2FsID0gd2lkZ2V0UG9zaXRpb25pbmcudmVydGljYWwudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgIGlmICh2ZXJ0aWNhbE1vZGVzLmluZGV4T2Yod2lkZ2V0UG9zaXRpb25pbmcudmVydGljYWwpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3dpZGdldFBvc2l0aW9uaW5nKCkgZXhwZWN0cyB2ZXJ0aWNhbCBwYXJhbWV0ZXIgdG8gYmUgb25lIG9mICgnICsgdmVydGljYWxNb2Rlcy5qb2luKCcsICcpICsgJyknKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG9wdGlvbnMud2lkZ2V0UG9zaXRpb25pbmcudmVydGljYWwgPSB3aWRnZXRQb3NpdGlvbmluZy52ZXJ0aWNhbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1cGRhdGUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwaWNrZXIuY2FsZW5kYXJXZWVrcyA9IGZ1bmN0aW9uIChjYWxlbmRhcldlZWtzKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5jYWxlbmRhcldlZWtzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGVuZGFyV2Vla3MgIT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2FsZW5kYXJXZWVrcygpIGV4cGVjdHMgcGFyYW1ldGVyIHRvIGJlIGEgYm9vbGVhbiB2YWx1ZScpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLmNhbGVuZGFyV2Vla3MgPSBjYWxlbmRhcldlZWtzO1xyXG4gICAgICAgICAgICB1cGRhdGUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwaWNrZXIuc2hvd1RvZGF5QnV0dG9uID0gZnVuY3Rpb24gKHNob3dUb2RheUJ1dHRvbikge1xyXG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuc2hvd1RvZGF5QnV0dG9uO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNob3dUb2RheUJ1dHRvbiAhPT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdzaG93VG9kYXlCdXR0b24oKSBleHBlY3RzIGEgYm9vbGVhbiBwYXJhbWV0ZXInKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy5zaG93VG9kYXlCdXR0b24gPSBzaG93VG9kYXlCdXR0b247XHJcbiAgICAgICAgICAgIGlmICh3aWRnZXQpIHtcclxuICAgICAgICAgICAgICAgIGhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci5zaG93Q2xlYXIgPSBmdW5jdGlvbiAoc2hvd0NsZWFyKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5zaG93Q2xlYXI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2hvd0NsZWFyICE9PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3Nob3dDbGVhcigpIGV4cGVjdHMgYSBib29sZWFuIHBhcmFtZXRlcicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLnNob3dDbGVhciA9IHNob3dDbGVhcjtcclxuICAgICAgICAgICAgaWYgKHdpZGdldCkge1xyXG4gICAgICAgICAgICAgICAgaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGlja2VyLndpZGdldFBhcmVudCA9IGZ1bmN0aW9uICh3aWRnZXRQYXJlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLndpZGdldFBhcmVudDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB3aWRnZXRQYXJlbnQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICB3aWRnZXRQYXJlbnQgPSAkKHdpZGdldFBhcmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh3aWRnZXRQYXJlbnQgIT09IG51bGwgJiYgKHR5cGVvZiB3aWRnZXRQYXJlbnQgIT09ICdzdHJpbmcnICYmICEod2lkZ2V0UGFyZW50IGluc3RhbmNlb2YgJCkpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd3aWRnZXRQYXJlbnQoKSBleHBlY3RzIGEgc3RyaW5nIG9yIGEgalF1ZXJ5IG9iamVjdCBwYXJhbWV0ZXInKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy53aWRnZXRQYXJlbnQgPSB3aWRnZXRQYXJlbnQ7XHJcbiAgICAgICAgICAgIGlmICh3aWRnZXQpIHtcclxuICAgICAgICAgICAgICAgIGhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci5rZWVwT3BlbiA9IGZ1bmN0aW9uIChrZWVwT3Blbikge1xyXG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMua2VlcE9wZW47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Yga2VlcE9wZW4gIT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigna2VlcE9wZW4oKSBleHBlY3RzIGEgYm9vbGVhbiBwYXJhbWV0ZXInKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy5rZWVwT3BlbiA9IGtlZXBPcGVuO1xyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci5mb2N1c09uU2hvdyA9IGZ1bmN0aW9uIChmb2N1c09uU2hvdykge1xyXG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm9jdXNPblNob3c7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZm9jdXNPblNob3cgIT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZm9jdXNPblNob3coKSBleHBlY3RzIGEgYm9vbGVhbiBwYXJhbWV0ZXInKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy5mb2N1c09uU2hvdyA9IGZvY3VzT25TaG93O1xyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci5pbmxpbmUgPSBmdW5jdGlvbiAoaW5saW5lKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbmxpbmU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5saW5lICE9PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2lubGluZSgpIGV4cGVjdHMgYSBib29sZWFuIHBhcmFtZXRlcicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLmlubGluZSA9IGlubGluZTtcclxuICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwaWNrZXIuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGNsZWFyKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGlja2VyLmtleUJpbmRzID0gZnVuY3Rpb24gKGtleUJpbmRzKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5rZXlCaW5kcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy5rZXlCaW5kcyA9IGtleUJpbmRzO1xyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci5nZXRNb21lbnQgPSBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZ2V0TW9tZW50KGQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci5kZWJ1ZyA9IGZ1bmN0aW9uIChkZWJ1Zykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRlYnVnICE9PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2RlYnVnKCkgZXhwZWN0cyBhIGJvb2xlYW4gcGFyYW1ldGVyJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG9wdGlvbnMuZGVidWcgPSBkZWJ1ZztcclxuICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwaWNrZXIuYWxsb3dJbnB1dFRvZ2dsZSA9IGZ1bmN0aW9uIChhbGxvd0lucHV0VG9nZ2xlKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5hbGxvd0lucHV0VG9nZ2xlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGFsbG93SW5wdXRUb2dnbGUgIT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYWxsb3dJbnB1dFRvZ2dsZSgpIGV4cGVjdHMgYSBib29sZWFuIHBhcmFtZXRlcicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLmFsbG93SW5wdXRUb2dnbGUgPSBhbGxvd0lucHV0VG9nZ2xlO1xyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci5zaG93Q2xvc2UgPSBmdW5jdGlvbiAoc2hvd0Nsb3NlKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5zaG93Q2xvc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2hvd0Nsb3NlICE9PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3Nob3dDbG9zZSgpIGV4cGVjdHMgYSBib29sZWFuIHBhcmFtZXRlcicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLnNob3dDbG9zZSA9IHNob3dDbG9zZTtcclxuICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwaWNrZXIua2VlcEludmFsaWQgPSBmdW5jdGlvbiAoa2VlcEludmFsaWQpIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmtlZXBJbnZhbGlkO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGtlZXBJbnZhbGlkICE9PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2tlZXBJbnZhbGlkKCkgZXhwZWN0cyBhIGJvb2xlYW4gcGFyYW1ldGVyJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3B0aW9ucy5rZWVwSW52YWxpZCA9IGtlZXBJbnZhbGlkO1xyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBpY2tlci5kYXRlcGlja2VySW5wdXQgPSBmdW5jdGlvbiAoZGF0ZXBpY2tlcklucHV0KSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5kYXRlcGlja2VySW5wdXQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0ZXBpY2tlcklucHV0ICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZGF0ZXBpY2tlcklucHV0KCkgZXhwZWN0cyBhIHN0cmluZyBwYXJhbWV0ZXInKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy5kYXRlcGlja2VySW5wdXQgPSBkYXRlcGlja2VySW5wdXQ7XHJcbiAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGlja2VyLnBhcnNlSW5wdXREYXRlID0gZnVuY3Rpb24gKHBhcnNlSW5wdXREYXRlKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5wYXJzZUlucHV0RGF0ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJzZUlucHV0RGF0ZSAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncGFyc2VJbnB1dERhdGUoKSBzaG9sdWQgYmUgYXMgZnVuY3Rpb24nKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy5wYXJzZUlucHV0RGF0ZSA9IHBhcnNlSW5wdXREYXRlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwaWNrZXIuZGlzYWJsZWRUaW1lSW50ZXJ2YWxzID0gZnVuY3Rpb24gKGRpc2FibGVkVGltZUludGVydmFscykge1xyXG4gICAgICAgICAgICAvLy88c2lnbmF0dXJlIGhlbHBLZXl3b3JkPVwiJC5mbi5kYXRldGltZXBpY2tlci5kaXNhYmxlZFRpbWVJbnRlcnZhbHNcIj5cclxuICAgICAgICAgICAgLy8vPHN1bW1hcnk+UmV0dXJucyBhbiBhcnJheSB3aXRoIHRoZSBjdXJyZW50bHkgc2V0IGRpc2FibGVkIGRhdGVzIG9uIHRoZSBjb21wb25lbnQuPC9zdW1tYXJ5PlxyXG4gICAgICAgICAgICAvLy88cmV0dXJucyB0eXBlPVwiYXJyYXlcIj5vcHRpb25zLmRpc2FibGVkVGltZUludGVydmFsczwvcmV0dXJucz5cclxuICAgICAgICAgICAgLy8vPC9zaWduYXR1cmU+XHJcbiAgICAgICAgICAgIC8vLzxzaWduYXR1cmU+XHJcbiAgICAgICAgICAgIC8vLzxzdW1tYXJ5PlNldHRpbmcgdGhpcyB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgb3B0aW9ucy5taW5EYXRlLCBvcHRpb25zLm1heERhdGUgY29uZmlndXJhdGlvbi4gQWxzbyBjYWxsaW5nIHRoaXMgZnVuY3Rpb24gcmVtb3ZlcyB0aGUgY29uZmlndXJhdGlvbiBvZlxyXG4gICAgICAgICAgICAvLy9vcHRpb25zLmVuYWJsZWREYXRlcyBpZiBzdWNoIGV4aXN0Ljwvc3VtbWFyeT5cclxuICAgICAgICAgICAgLy8vPHBhcmFtIG5hbWU9XCJkYXRlc1wiIGxvY2lkPVwiJC5mbi5kYXRldGltZXBpY2tlci5kaXNhYmxlZFRpbWVJbnRlcnZhbHNfcDpkYXRlc1wiPlRha2VzIGFuIFsgc3RyaW5nIG9yIERhdGUgb3IgbW9tZW50IF0gb2YgdmFsdWVzIGFuZCBhbGxvd3MgdGhlIHVzZXIgdG8gc2VsZWN0IG9ubHkgZnJvbSB0aG9zZSBkYXlzLjwvcGFyYW0+XHJcbiAgICAgICAgICAgIC8vLzwvc2lnbmF0dXJlPlxyXG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChvcHRpb25zLmRpc2FibGVkVGltZUludGVydmFscyA/ICQuZXh0ZW5kKHt9LCBvcHRpb25zLmRpc2FibGVkVGltZUludGVydmFscykgOiBvcHRpb25zLmRpc2FibGVkVGltZUludGVydmFscyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghZGlzYWJsZWRUaW1lSW50ZXJ2YWxzKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmRpc2FibGVkVGltZUludGVydmFscyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghKGRpc2FibGVkVGltZUludGVydmFscyBpbnN0YW5jZW9mIEFycmF5KSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZGlzYWJsZWRUaW1lSW50ZXJ2YWxzKCkgZXhwZWN0cyBhbiBhcnJheSBwYXJhbWV0ZXInKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcHRpb25zLmRpc2FibGVkVGltZUludGVydmFscyA9IGRpc2FibGVkVGltZUludGVydmFscztcclxuICAgICAgICAgICAgdXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGlja2VyLmRpc2FibGVkSG91cnMgPSBmdW5jdGlvbiAoaG91cnMpIHtcclxuICAgICAgICAgICAgLy8vPHNpZ25hdHVyZSBoZWxwS2V5d29yZD1cIiQuZm4uZGF0ZXRpbWVwaWNrZXIuZGlzYWJsZWRIb3Vyc1wiPlxyXG4gICAgICAgICAgICAvLy88c3VtbWFyeT5SZXR1cm5zIGFuIGFycmF5IHdpdGggdGhlIGN1cnJlbnRseSBzZXQgZGlzYWJsZWQgaG91cnMgb24gdGhlIGNvbXBvbmVudC48L3N1bW1hcnk+XHJcbiAgICAgICAgICAgIC8vLzxyZXR1cm5zIHR5cGU9XCJhcnJheVwiPm9wdGlvbnMuZGlzYWJsZWRIb3VyczwvcmV0dXJucz5cclxuICAgICAgICAgICAgLy8vPC9zaWduYXR1cmU+XHJcbiAgICAgICAgICAgIC8vLzxzaWduYXR1cmU+XHJcbiAgICAgICAgICAgIC8vLzxzdW1tYXJ5PlNldHRpbmcgdGhpcyB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgb3B0aW9ucy5taW5EYXRlLCBvcHRpb25zLm1heERhdGUgY29uZmlndXJhdGlvbi4gQWxzbyBjYWxsaW5nIHRoaXMgZnVuY3Rpb24gcmVtb3ZlcyB0aGUgY29uZmlndXJhdGlvbiBvZlxyXG4gICAgICAgICAgICAvLy9vcHRpb25zLmVuYWJsZWRIb3VycyBpZiBzdWNoIGV4aXN0Ljwvc3VtbWFyeT5cclxuICAgICAgICAgICAgLy8vPHBhcmFtIG5hbWU9XCJob3Vyc1wiIGxvY2lkPVwiJC5mbi5kYXRldGltZXBpY2tlci5kaXNhYmxlZEhvdXJzX3A6aG91cnNcIj5UYWtlcyBhbiBbIGludCBdIG9mIHZhbHVlcyBhbmQgZGlzYWxsb3dzIHRoZSB1c2VyIHRvIHNlbGVjdCBvbmx5IGZyb20gdGhvc2UgaG91cnMuPC9wYXJhbT5cclxuICAgICAgICAgICAgLy8vPC9zaWduYXR1cmU+XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKG9wdGlvbnMuZGlzYWJsZWRIb3VycyA/ICQuZXh0ZW5kKHt9LCBvcHRpb25zLmRpc2FibGVkSG91cnMpIDogb3B0aW9ucy5kaXNhYmxlZEhvdXJzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFob3Vycykge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5kaXNhYmxlZEhvdXJzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCEoaG91cnMgaW5zdGFuY2VvZiBBcnJheSkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2Rpc2FibGVkSG91cnMoKSBleHBlY3RzIGFuIGFycmF5IHBhcmFtZXRlcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wdGlvbnMuZGlzYWJsZWRIb3VycyA9IGluZGV4R2l2ZW5Ib3Vycyhob3Vycyk7XHJcbiAgICAgICAgICAgIG9wdGlvbnMuZW5hYmxlZEhvdXJzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnVzZUN1cnJlbnQgJiYgIW9wdGlvbnMua2VlcEludmFsaWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0cmllcyA9IDA7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWlzVmFsaWQoZGF0ZSwgJ2gnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGUuYWRkKDEsICdoJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyaWVzID09PSAyNCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyAnVHJpZWQgMjQgdGltZXMgdG8gZmluZCBhIHZhbGlkIGRhdGUnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0cmllcysrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUoZGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGlja2VyLmVuYWJsZWRIb3VycyA9IGZ1bmN0aW9uIChob3Vycykge1xyXG4gICAgICAgICAgICAvLy88c2lnbmF0dXJlIGhlbHBLZXl3b3JkPVwiJC5mbi5kYXRldGltZXBpY2tlci5lbmFibGVkSG91cnNcIj5cclxuICAgICAgICAgICAgLy8vPHN1bW1hcnk+UmV0dXJucyBhbiBhcnJheSB3aXRoIHRoZSBjdXJyZW50bHkgc2V0IGVuYWJsZWQgaG91cnMgb24gdGhlIGNvbXBvbmVudC48L3N1bW1hcnk+XHJcbiAgICAgICAgICAgIC8vLzxyZXR1cm5zIHR5cGU9XCJhcnJheVwiPm9wdGlvbnMuZW5hYmxlZEhvdXJzPC9yZXR1cm5zPlxyXG4gICAgICAgICAgICAvLy88L3NpZ25hdHVyZT5cclxuICAgICAgICAgICAgLy8vPHNpZ25hdHVyZT5cclxuICAgICAgICAgICAgLy8vPHN1bW1hcnk+U2V0dGluZyB0aGlzIHRha2VzIHByZWNlZGVuY2Ugb3ZlciBvcHRpb25zLm1pbkRhdGUsIG9wdGlvbnMubWF4RGF0ZSBjb25maWd1cmF0aW9uLiBBbHNvIGNhbGxpbmcgdGhpcyBmdW5jdGlvbiByZW1vdmVzIHRoZSBjb25maWd1cmF0aW9uIG9mIG9wdGlvbnMuZGlzYWJsZWRIb3VycyBpZiBzdWNoIGV4aXN0Ljwvc3VtbWFyeT5cclxuICAgICAgICAgICAgLy8vPHBhcmFtIG5hbWU9XCJob3Vyc1wiIGxvY2lkPVwiJC5mbi5kYXRldGltZXBpY2tlci5lbmFibGVkSG91cnNfcDpob3Vyc1wiPlRha2VzIGFuIFsgaW50IF0gb2YgdmFsdWVzIGFuZCBhbGxvd3MgdGhlIHVzZXIgdG8gc2VsZWN0IG9ubHkgZnJvbSB0aG9zZSBob3Vycy48L3BhcmFtPlxyXG4gICAgICAgICAgICAvLy88L3NpZ25hdHVyZT5cclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAob3B0aW9ucy5lbmFibGVkSG91cnMgPyAkLmV4dGVuZCh7fSwgb3B0aW9ucy5lbmFibGVkSG91cnMpIDogb3B0aW9ucy5lbmFibGVkSG91cnMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIWhvdXJzKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmVuYWJsZWRIb3VycyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghKGhvdXJzIGluc3RhbmNlb2YgQXJyYXkpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdlbmFibGVkSG91cnMoKSBleHBlY3RzIGFuIGFycmF5IHBhcmFtZXRlcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wdGlvbnMuZW5hYmxlZEhvdXJzID0gaW5kZXhHaXZlbkhvdXJzKGhvdXJzKTtcclxuICAgICAgICAgICAgb3B0aW9ucy5kaXNhYmxlZEhvdXJzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnVzZUN1cnJlbnQgJiYgIW9wdGlvbnMua2VlcEludmFsaWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0cmllcyA9IDA7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWlzVmFsaWQoZGF0ZSwgJ2gnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGUuYWRkKDEsICdoJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyaWVzID09PSAyNCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyAnVHJpZWQgMjQgdGltZXMgdG8gZmluZCBhIHZhbGlkIGRhdGUnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0cmllcysrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUoZGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBwaWNrZXI7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBjb21wb25lbnQncyBtb2RlbCBjdXJyZW50IHZpZXdEYXRlLCBhIG1vbWVudCBvYmplY3Qgb3IgbnVsbCBpZiBub3Qgc2V0LiBQYXNzaW5nIGEgbnVsbCB2YWx1ZSB1bnNldHMgdGhlIGNvbXBvbmVudHMgbW9kZWwgY3VycmVudCBtb21lbnQuIFBhcnNpbmcgb2YgdGhlIG5ld0RhdGUgcGFyYW1ldGVyIGlzIG1hZGUgdXNpbmcgbW9tZW50IGxpYnJhcnkgd2l0aCB0aGUgb3B0aW9ucy5mb3JtYXQgYW5kIG9wdGlvbnMudXNlU3RyaWN0IGNvbXBvbmVudHMgY29uZmlndXJhdGlvbi5cclxuICAgICAgICAgKiBAcGFyYW0ge1Rha2VzIHN0cmluZywgdmlld0RhdGUsIG1vbWVudCwgbnVsbCBwYXJhbWV0ZXIufSBuZXdEYXRlXHJcbiAgICAgICAgICogQHJldHVybnMge3ZpZXdEYXRlLmNsb25lKCl9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcGlja2VyLnZpZXdEYXRlID0gZnVuY3Rpb24gKG5ld0RhdGUpIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2aWV3RGF0ZS5jbG9uZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5ld0RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHZpZXdEYXRlID0gZGF0ZS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBpY2tlcjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBuZXdEYXRlICE9PSAnc3RyaW5nJyAmJiAhbW9tZW50LmlzTW9tZW50KG5ld0RhdGUpICYmICEobmV3RGF0ZSBpbnN0YW5jZW9mIERhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2aWV3RGF0ZSgpIHBhcmFtZXRlciBtdXN0IGJlIG9uZSBvZiBbc3RyaW5nLCBtb21lbnQgb3IgRGF0ZV0nKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmlld0RhdGUgPSBwYXJzZUlucHV0RGF0ZShuZXdEYXRlKTtcclxuICAgICAgICAgICAgdmlld1VwZGF0ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIGluaXRpYWxpemluZyBlbGVtZW50IGFuZCBjb21wb25lbnQgYXR0cmlidXRlc1xyXG4gICAgICAgIGlmIChlbGVtZW50LmlzKCdpbnB1dCcpKSB7XHJcbiAgICAgICAgICAgIGlucHV0ID0gZWxlbWVudDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpbnB1dCA9IGVsZW1lbnQuZmluZChvcHRpb25zLmRhdGVwaWNrZXJJbnB1dCk7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGlucHV0ID0gZWxlbWVudC5maW5kKCdpbnB1dCcpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpbnB1dC5pcygnaW5wdXQnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDU1MgY2xhc3MgXCInICsgb3B0aW9ucy5kYXRlcGlja2VySW5wdXQgKyAnXCIgY2Fubm90IGJlIGFwcGxpZWQgdG8gbm9uIGlucHV0IGVsZW1lbnQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGVsZW1lbnQuaGFzQ2xhc3MoJ2lucHV0LWdyb3VwJykpIHtcclxuICAgICAgICAgICAgLy8gaW4gY2FzZSB0aGVyZSBpcyBtb3JlIHRoZW4gb25lICdpbnB1dC1ncm91cC1hZGRvbicgSXNzdWUgIzQ4XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmZpbmQoJy5kYXRlcGlja2VyYnV0dG9uJykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnQgPSBlbGVtZW50LmZpbmQoJy5pbnB1dC1ncm91cC1hZGRvbicpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50ID0gZWxlbWVudC5maW5kKCcuZGF0ZXBpY2tlcmJ1dHRvbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIW9wdGlvbnMuaW5saW5lICYmICFpbnB1dC5pcygnaW5wdXQnKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBpbml0aWFsaXplIERhdGVUaW1lUGlja2VyIHdpdGhvdXQgYW4gaW5wdXQgZWxlbWVudCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2V0IGRlZmF1bHRzIGZvciBkYXRlIGhlcmUgbm93IGluc3RlYWQgb2YgaW4gdmFyIGRlY2xhcmF0aW9uXHJcbiAgICAgICAgZGF0ZSA9IGdldE1vbWVudCgpO1xyXG4gICAgICAgIHZpZXdEYXRlID0gZGF0ZS5jbG9uZSgpO1xyXG5cclxuICAgICAgICAkLmV4dGVuZCh0cnVlLCBvcHRpb25zLCBkYXRhVG9PcHRpb25zKCkpO1xyXG5cclxuICAgICAgICBwaWNrZXIub3B0aW9ucyhvcHRpb25zKTtcclxuXHJcbiAgICAgICAgaW5pdEZvcm1hdHRpbmcoKTtcclxuXHJcbiAgICAgICAgYXR0YWNoRGF0ZVBpY2tlckVsZW1lbnRFdmVudHMoKTtcclxuXHJcbiAgICAgICAgaWYgKGlucHV0LnByb3AoJ2Rpc2FibGVkJykpIHtcclxuICAgICAgICAgICAgcGlja2VyLmRpc2FibGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlucHV0LmlzKCdpbnB1dCcpICYmIGlucHV0LnZhbCgpLnRyaW0oKS5sZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgc2V0VmFsdWUocGFyc2VJbnB1dERhdGUoaW5wdXQudmFsKCkudHJpbSgpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuZGVmYXVsdERhdGUgJiYgaW5wdXQuYXR0cigncGxhY2Vob2xkZXInKSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHNldFZhbHVlKG9wdGlvbnMuZGVmYXVsdERhdGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0aW9ucy5pbmxpbmUpIHtcclxuICAgICAgICAgICAgc2hvdygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGlja2VyO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqXHJcbiAgICAgKiBqUXVlcnkgcGx1Z2luIGNvbnN0cnVjdG9yIGFuZCBkZWZhdWx0cyBvYmplY3RcclxuICAgICAqXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gICAgLyoqXHJcbiAgICAqIFNlZSAoaHR0cDovL2pxdWVyeS5jb20vKS5cclxuICAgICogQG5hbWUgalF1ZXJ5XHJcbiAgICAqIEBjbGFzc1xyXG4gICAgKiBTZWUgdGhlIGpRdWVyeSBMaWJyYXJ5ICAoaHR0cDovL2pxdWVyeS5jb20vKSBmb3IgZnVsbCBkZXRhaWxzLiAgVGhpcyBqdXN0XHJcbiAgICAqIGRvY3VtZW50cyB0aGUgZnVuY3Rpb24gYW5kIGNsYXNzZXMgdGhhdCBhcmUgYWRkZWQgdG8galF1ZXJ5IGJ5IHRoaXMgcGx1Zy1pbi5cclxuICAgICovXHJcbiAgICAvKipcclxuICAgICAqIFNlZSAoaHR0cDovL2pxdWVyeS5jb20vKVxyXG4gICAgICogQG5hbWUgZm5cclxuICAgICAqIEBjbGFzc1xyXG4gICAgICogU2VlIHRoZSBqUXVlcnkgTGlicmFyeSAgKGh0dHA6Ly9qcXVlcnkuY29tLykgZm9yIGZ1bGwgZGV0YWlscy4gIFRoaXMganVzdFxyXG4gICAgICogZG9jdW1lbnRzIHRoZSBmdW5jdGlvbiBhbmQgY2xhc3NlcyB0aGF0IGFyZSBhZGRlZCB0byBqUXVlcnkgYnkgdGhpcyBwbHVnLWluLlxyXG4gICAgICogQG1lbWJlck9mIGpRdWVyeVxyXG4gICAgICovXHJcbiAgICAvKipcclxuICAgICAqIFNob3cgY29tbWVudHNcclxuICAgICAqIEBjbGFzcyBkYXRldGltZXBpY2tlclxyXG4gICAgICogQG1lbWJlck9mIGpRdWVyeS5mblxyXG4gICAgICovXHJcbiAgICAkLmZuLmRhdGV0aW1lcGlja2VyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuXHJcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxyXG4gICAgICAgICAgICBpc0luc3RhbmNlID0gdHJ1ZSxcclxuICAgICAgICAgICAgdGhpc01ldGhvZHMgPSBbJ2Rlc3Ryb3knLCAnaGlkZScsICdzaG93JywgJ3RvZ2dsZSddLFxyXG4gICAgICAgICAgICByZXR1cm5WYWx1ZTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgX29wdGlvbnM7XHJcbiAgICAgICAgICAgICAgICBpZiAoISR0aGlzLmRhdGEoJ0RhdGVUaW1lUGlja2VyJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYSBwcml2YXRlIGNvcHkgb2YgdGhlIGRlZmF1bHRzIG9iamVjdFxyXG4gICAgICAgICAgICAgICAgICAgIF9vcHRpb25zID0gJC5leHRlbmQodHJ1ZSwge30sICQuZm4uZGF0ZXRpbWVwaWNrZXIuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoJ0RhdGVUaW1lUGlja2VyJywgZGF0ZVRpbWVQaWNrZXIoJHRoaXMsIF9vcHRpb25zKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlID0gJHRoaXMuZGF0YSgnRGF0ZVRpbWVQaWNrZXInKTtcclxuICAgICAgICAgICAgICAgIGlmICghaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jvb3RzdHJhcC1kYXRldGltZXBpY2tlcihcIicgKyBvcHRpb25zICsgJ1wiKSBtZXRob2Qgd2FzIGNhbGxlZCBvbiBhbiBlbGVtZW50IHRoYXQgaXMgbm90IHVzaW5nIERhdGVUaW1lUGlja2VyJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSBpbnN0YW5jZVtvcHRpb25zXS5hcHBseShpbnN0YW5jZSwgYXJncyk7XHJcbiAgICAgICAgICAgICAgICBpc0luc3RhbmNlID0gcmV0dXJuVmFsdWUgPT09IGluc3RhbmNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc0luc3RhbmNlIHx8ICQuaW5BcnJheShvcHRpb25zLCB0aGlzTWV0aG9kcykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgYXJndW1lbnRzIGZvciBEYXRlVGltZVBpY2tlcjogJyArIG9wdGlvbnMpO1xyXG4gICAgfTtcclxuXHJcbiAgICAkLmZuLmRhdGV0aW1lcGlja2VyLmRlZmF1bHRzID0ge1xyXG4gICAgICAgIHRpbWVab25lOiAnJyxcclxuICAgICAgICBmb3JtYXQ6IGZhbHNlLFxyXG4gICAgICAgIGRheVZpZXdIZWFkZXJGb3JtYXQ6ICdNTU1NIFlZWVknLFxyXG4gICAgICAgIGV4dHJhRm9ybWF0czogZmFsc2UsXHJcbiAgICAgICAgc3RlcHBpbmc6IDEsXHJcbiAgICAgICAgbWluRGF0ZTogZmFsc2UsXHJcbiAgICAgICAgbWF4RGF0ZTogZmFsc2UsXHJcbiAgICAgICAgdXNlQ3VycmVudDogdHJ1ZSxcclxuICAgICAgICBjb2xsYXBzZTogdHJ1ZSxcclxuICAgICAgICBsb2NhbGU6IG1vbWVudC5sb2NhbGUoKSxcclxuICAgICAgICBkZWZhdWx0RGF0ZTogZmFsc2UsXHJcbiAgICAgICAgZGlzYWJsZWREYXRlczogZmFsc2UsXHJcbiAgICAgICAgZW5hYmxlZERhdGVzOiBmYWxzZSxcclxuICAgICAgICBpY29uczoge1xyXG4gICAgICAgICAgICB0aW1lOiAnZ2x5cGhpY29uIGdseXBoaWNvbi10aW1lJyxcclxuICAgICAgICAgICAgZGF0ZTogJ2dseXBoaWNvbiBnbHlwaGljb24tY2FsZW5kYXInLFxyXG4gICAgICAgICAgICB1cDogJ2dseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi11cCcsXHJcbiAgICAgICAgICAgIGRvd246ICdnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tZG93bicsXHJcbiAgICAgICAgICAgIHByZXZpb3VzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLWxlZnQnLFxyXG4gICAgICAgICAgICBuZXh0OiAnZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLXJpZ2h0JyxcclxuICAgICAgICAgICAgdG9kYXk6ICdnbHlwaGljb24gZ2x5cGhpY29uLXNjcmVlbnNob3QnLFxyXG4gICAgICAgICAgICBjbGVhcjogJ2dseXBoaWNvbiBnbHlwaGljb24tdHJhc2gnLFxyXG4gICAgICAgICAgICBjbG9zZTogJ2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG9vbHRpcHM6IHtcclxuICAgICAgICAgICAgdG9kYXk6ICdHbyB0byB0b2RheScsXHJcbiAgICAgICAgICAgIGNsZWFyOiAnQ2xlYXIgc2VsZWN0aW9uJyxcclxuICAgICAgICAgICAgY2xvc2U6ICdDbG9zZSB0aGUgcGlja2VyJyxcclxuICAgICAgICAgICAgc2VsZWN0TW9udGg6ICdTZWxlY3QgTW9udGgnLFxyXG4gICAgICAgICAgICBwcmV2TW9udGg6ICdQcmV2aW91cyBNb250aCcsXHJcbiAgICAgICAgICAgIG5leHRNb250aDogJ05leHQgTW9udGgnLFxyXG4gICAgICAgICAgICBzZWxlY3RZZWFyOiAnU2VsZWN0IFllYXInLFxyXG4gICAgICAgICAgICBwcmV2WWVhcjogJ1ByZXZpb3VzIFllYXInLFxyXG4gICAgICAgICAgICBuZXh0WWVhcjogJ05leHQgWWVhcicsXHJcbiAgICAgICAgICAgIHNlbGVjdERlY2FkZTogJ1NlbGVjdCBEZWNhZGUnLFxyXG4gICAgICAgICAgICBwcmV2RGVjYWRlOiAnUHJldmlvdXMgRGVjYWRlJyxcclxuICAgICAgICAgICAgbmV4dERlY2FkZTogJ05leHQgRGVjYWRlJyxcclxuICAgICAgICAgICAgcHJldkNlbnR1cnk6ICdQcmV2aW91cyBDZW50dXJ5JyxcclxuICAgICAgICAgICAgbmV4dENlbnR1cnk6ICdOZXh0IENlbnR1cnknLFxyXG4gICAgICAgICAgICBwaWNrSG91cjogJ1BpY2sgSG91cicsXHJcbiAgICAgICAgICAgIGluY3JlbWVudEhvdXI6ICdJbmNyZW1lbnQgSG91cicsXHJcbiAgICAgICAgICAgIGRlY3JlbWVudEhvdXI6ICdEZWNyZW1lbnQgSG91cicsXHJcbiAgICAgICAgICAgIHBpY2tNaW51dGU6ICdQaWNrIE1pbnV0ZScsXHJcbiAgICAgICAgICAgIGluY3JlbWVudE1pbnV0ZTogJ0luY3JlbWVudCBNaW51dGUnLFxyXG4gICAgICAgICAgICBkZWNyZW1lbnRNaW51dGU6ICdEZWNyZW1lbnQgTWludXRlJyxcclxuICAgICAgICAgICAgcGlja1NlY29uZDogJ1BpY2sgU2Vjb25kJyxcclxuICAgICAgICAgICAgaW5jcmVtZW50U2Vjb25kOiAnSW5jcmVtZW50IFNlY29uZCcsXHJcbiAgICAgICAgICAgIGRlY3JlbWVudFNlY29uZDogJ0RlY3JlbWVudCBTZWNvbmQnLFxyXG4gICAgICAgICAgICB0b2dnbGVQZXJpb2Q6ICdUb2dnbGUgUGVyaW9kJyxcclxuICAgICAgICAgICAgc2VsZWN0VGltZTogJ1NlbGVjdCBUaW1lJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXNlU3RyaWN0OiBmYWxzZSxcclxuICAgICAgICBzaWRlQnlTaWRlOiBmYWxzZSxcclxuICAgICAgICBkYXlzT2ZXZWVrRGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgIGNhbGVuZGFyV2Vla3M6IGZhbHNlLFxyXG4gICAgICAgIHZpZXdNb2RlOiAnZGF5cycsXHJcbiAgICAgICAgdG9vbGJhclBsYWNlbWVudDogJ2RlZmF1bHQnLFxyXG4gICAgICAgIHNob3dUb2RheUJ1dHRvbjogZmFsc2UsXHJcbiAgICAgICAgc2hvd0NsZWFyOiBmYWxzZSxcclxuICAgICAgICBzaG93Q2xvc2U6IGZhbHNlLFxyXG4gICAgICAgIHdpZGdldFBvc2l0aW9uaW5nOiB7XHJcbiAgICAgICAgICAgIGhvcml6b250YWw6ICdhdXRvJyxcclxuICAgICAgICAgICAgdmVydGljYWw6ICdhdXRvJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgd2lkZ2V0UGFyZW50OiBudWxsLFxyXG4gICAgICAgIGlnbm9yZVJlYWRvbmx5OiBmYWxzZSxcclxuICAgICAgICBrZWVwT3BlbjogZmFsc2UsXHJcbiAgICAgICAgZm9jdXNPblNob3c6IHRydWUsXHJcbiAgICAgICAgaW5saW5lOiBmYWxzZSxcclxuICAgICAgICBrZWVwSW52YWxpZDogZmFsc2UsXHJcbiAgICAgICAgZGF0ZXBpY2tlcklucHV0OiAnLmRhdGVwaWNrZXJpbnB1dCcsXHJcbiAgICAgICAga2V5QmluZHM6IHtcclxuICAgICAgICAgICAgdXA6IGZ1bmN0aW9uICh3aWRnZXQpIHtcclxuICAgICAgICAgICAgICAgIGlmICghd2lkZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIGQgPSB0aGlzLmRhdGUoKSB8fCB0aGlzLmdldE1vbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpZGdldC5maW5kKCcuZGF0ZXBpY2tlcicpLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlKGQuY2xvbmUoKS5zdWJ0cmFjdCg3LCAnZCcpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlKGQuY2xvbmUoKS5hZGQodGhpcy5zdGVwcGluZygpLCAnbScpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZG93bjogZnVuY3Rpb24gKHdpZGdldCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF3aWRnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgZCA9IHRoaXMuZGF0ZSgpIHx8IHRoaXMuZ2V0TW9tZW50KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAod2lkZ2V0LmZpbmQoJy5kYXRlcGlja2VyJykuaXMoJzp2aXNpYmxlJykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUoZC5jbG9uZSgpLmFkZCg3LCAnZCcpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlKGQuY2xvbmUoKS5zdWJ0cmFjdCh0aGlzLnN0ZXBwaW5nKCksICdtJykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnY29udHJvbCB1cCc6IGZ1bmN0aW9uICh3aWRnZXQpIHtcclxuICAgICAgICAgICAgICAgIGlmICghd2lkZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIGQgPSB0aGlzLmRhdGUoKSB8fCB0aGlzLmdldE1vbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpZGdldC5maW5kKCcuZGF0ZXBpY2tlcicpLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlKGQuY2xvbmUoKS5zdWJ0cmFjdCgxLCAneScpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlKGQuY2xvbmUoKS5hZGQoMSwgJ2gnKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdjb250cm9sIGRvd24nOiBmdW5jdGlvbiAod2lkZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXdpZGdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBkID0gdGhpcy5kYXRlKCkgfHwgdGhpcy5nZXRNb21lbnQoKTtcclxuICAgICAgICAgICAgICAgIGlmICh3aWRnZXQuZmluZCgnLmRhdGVwaWNrZXInKS5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZShkLmNsb25lKCkuYWRkKDEsICd5JykpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUoZC5jbG9uZSgpLnN1YnRyYWN0KDEsICdoJykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBsZWZ0OiBmdW5jdGlvbiAod2lkZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXdpZGdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBkID0gdGhpcy5kYXRlKCkgfHwgdGhpcy5nZXRNb21lbnQoKTtcclxuICAgICAgICAgICAgICAgIGlmICh3aWRnZXQuZmluZCgnLmRhdGVwaWNrZXInKS5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZShkLmNsb25lKCkuc3VidHJhY3QoMSwgJ2QnKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJpZ2h0OiBmdW5jdGlvbiAod2lkZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXdpZGdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBkID0gdGhpcy5kYXRlKCkgfHwgdGhpcy5nZXRNb21lbnQoKTtcclxuICAgICAgICAgICAgICAgIGlmICh3aWRnZXQuZmluZCgnLmRhdGVwaWNrZXInKS5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZShkLmNsb25lKCkuYWRkKDEsICdkJykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwYWdlVXA6IGZ1bmN0aW9uICh3aWRnZXQpIHtcclxuICAgICAgICAgICAgICAgIGlmICghd2lkZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIGQgPSB0aGlzLmRhdGUoKSB8fCB0aGlzLmdldE1vbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpZGdldC5maW5kKCcuZGF0ZXBpY2tlcicpLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlKGQuY2xvbmUoKS5zdWJ0cmFjdCgxLCAnTScpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcGFnZURvd246IGZ1bmN0aW9uICh3aWRnZXQpIHtcclxuICAgICAgICAgICAgICAgIGlmICghd2lkZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIGQgPSB0aGlzLmRhdGUoKSB8fCB0aGlzLmdldE1vbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpZGdldC5maW5kKCcuZGF0ZXBpY2tlcicpLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlKGQuY2xvbmUoKS5hZGQoMSwgJ00nKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVudGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXNjYXBlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy90YWI6IGZ1bmN0aW9uICh3aWRnZXQpIHsgLy90aGlzIGJyZWFrIHRoZSBmbG93IG9mIHRoZSBmb3JtLiBkaXNhYmxpbmcgZm9yIG5vd1xyXG4gICAgICAgICAgICAvLyAgICB2YXIgdG9nZ2xlID0gd2lkZ2V0LmZpbmQoJy5waWNrZXItc3dpdGNoIGFbZGF0YS1hY3Rpb249XCJ0b2dnbGVQaWNrZXJcIl0nKTtcclxuICAgICAgICAgICAgLy8gICAgaWYodG9nZ2xlLmxlbmd0aCA+IDApIHRvZ2dsZS5jbGljaygpO1xyXG4gICAgICAgICAgICAvL30sXHJcbiAgICAgICAgICAgICdjb250cm9sIHNwYWNlJzogZnVuY3Rpb24gKHdpZGdldCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF3aWRnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAod2lkZ2V0LmZpbmQoJy50aW1lcGlja2VyJykuaXMoJzp2aXNpYmxlJykpIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWRnZXQuZmluZCgnLmJ0bltkYXRhLWFjdGlvbj1cInRvZ2dsZVBlcmlvZFwiXScpLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSh0aGlzLmdldE1vbWVudCgpKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVidWc6IGZhbHNlLFxyXG4gICAgICAgIGFsbG93SW5wdXRUb2dnbGU6IGZhbHNlLFxyXG4gICAgICAgIGRpc2FibGVkVGltZUludGVydmFsczogZmFsc2UsXHJcbiAgICAgICAgZGlzYWJsZWRIb3VyczogZmFsc2UsXHJcbiAgICAgICAgZW5hYmxlZEhvdXJzOiBmYWxzZSxcclxuICAgICAgICB2aWV3RGF0ZTogZmFsc2VcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuICQuZm4uZGF0ZXRpbWVwaWNrZXI7XHJcbn0pKTsiXSwiZmlsZSI6ImFzc2V0cy9ib290c3RyYXAtZGF0ZXRpbWVwaWNrZXIuanMifQ==
