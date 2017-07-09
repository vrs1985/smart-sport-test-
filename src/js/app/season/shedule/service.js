season.factory('checkboxComponent', function () {
  return {
    block: function (day, days) {
      var dayRu = days.ru[days['en'].indexOf(day)];
      var span = angular.element('<span>');
      var input = angular.element('<input>')
          .addClass('form-control')
          .attr('type', 'checkbox')
          .attr('name', day)
          .attr('item', 'day')
          .attr('checkDays', '')
          .attr('default-days', 'days')
          .attr('checkbox-day-input', '');
      var label = angular.element('<label>')
          .attr('checkbox-day-label', '')
          .html(dayRu);
          span.append(input).append(label);
          return span;
    },
    inputTime: function (model) {
      var inputTime = angular.element('<input />')
      .addClass('shedule-input-time').addClass('form-control')
      .attr('type', 'time')
      .attr('name', model)
      .attr('ng-pattern', '/([0-2]{1}[0-9]{1}:[0-5]{1}[0-9]{1})/')
      .attr('ng-model', model)
      .attr('value', 'HH:MM')
      .attr('checkbox-day-input', '')
      .attr('timepicker','');
      return inputTime;
    }
  };
});
