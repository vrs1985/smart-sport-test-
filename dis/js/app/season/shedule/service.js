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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAvc2Vhc29uL3NoZWR1bGUvc2VydmljZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJzZWFzb24uZmFjdG9yeSgnY2hlY2tib3hDb21wb25lbnQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGJsb2NrOiBmdW5jdGlvbiAoZGF5LCBkYXlzKSB7XHJcbiAgICAgIHZhciBkYXlSdSA9IGRheXMucnVbZGF5c1snZW4nXS5pbmRleE9mKGRheSldO1xyXG4gICAgICB2YXIgc3BhbiA9IGFuZ3VsYXIuZWxlbWVudCgnPHNwYW4+Jyk7XHJcbiAgICAgIHZhciBpbnB1dCA9IGFuZ3VsYXIuZWxlbWVudCgnPGlucHV0PicpXHJcbiAgICAgICAgICAuYWRkQ2xhc3MoJ2Zvcm0tY29udHJvbCcpXHJcbiAgICAgICAgICAuYXR0cigndHlwZScsICdjaGVja2JveCcpXHJcbiAgICAgICAgICAuYXR0cignbmFtZScsIGRheSlcclxuICAgICAgICAgIC5hdHRyKCdpdGVtJywgJ2RheScpXHJcbiAgICAgICAgICAuYXR0cignY2hlY2tEYXlzJywgJycpXHJcbiAgICAgICAgICAuYXR0cignZGVmYXVsdC1kYXlzJywgJ2RheXMnKVxyXG4gICAgICAgICAgLmF0dHIoJ2NoZWNrYm94LWRheS1pbnB1dCcsICcnKTtcclxuICAgICAgdmFyIGxhYmVsID0gYW5ndWxhci5lbGVtZW50KCc8bGFiZWw+JylcclxuICAgICAgICAgIC5hdHRyKCdjaGVja2JveC1kYXktbGFiZWwnLCAnJylcclxuICAgICAgICAgIC5odG1sKGRheVJ1KTtcclxuICAgICAgICAgIHNwYW4uYXBwZW5kKGlucHV0KS5hcHBlbmQobGFiZWwpO1xyXG4gICAgICAgICAgcmV0dXJuIHNwYW47XHJcbiAgICB9LFxyXG4gICAgaW5wdXRUaW1lOiBmdW5jdGlvbiAobW9kZWwpIHtcclxuICAgICAgdmFyIGlucHV0VGltZSA9IGFuZ3VsYXIuZWxlbWVudCgnPGlucHV0IC8+JylcclxuICAgICAgLmFkZENsYXNzKCdzaGVkdWxlLWlucHV0LXRpbWUnKS5hZGRDbGFzcygnZm9ybS1jb250cm9sJylcclxuICAgICAgLmF0dHIoJ3R5cGUnLCAndGltZScpXHJcbiAgICAgIC5hdHRyKCduYW1lJywgbW9kZWwpXHJcbiAgICAgIC5hdHRyKCduZy1wYXR0ZXJuJywgJy8oWzAtMl17MX1bMC05XXsxfTpbMC01XXsxfVswLTldezF9KS8nKVxyXG4gICAgICAuYXR0cignbmctbW9kZWwnLCBtb2RlbClcclxuICAgICAgLmF0dHIoJ3ZhbHVlJywgJ0hIOk1NJylcclxuICAgICAgLmF0dHIoJ2NoZWNrYm94LWRheS1pbnB1dCcsICcnKVxyXG4gICAgICAuYXR0cigndGltZXBpY2tlcicsJycpO1xyXG4gICAgICByZXR1cm4gaW5wdXRUaW1lO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pOyJdLCJmaWxlIjoiYXBwL3NlYXNvbi9zaGVkdWxlL3NlcnZpY2UuanMifQ==
