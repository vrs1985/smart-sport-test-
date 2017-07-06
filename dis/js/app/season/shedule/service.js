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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAvc2Vhc29uL3NoZWR1bGUvc2VydmljZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJzZWFzb24uZmFjdG9yeSgnc2hlZHVsZVJvd0VtcHR5JywgZnVuY3Rpb24gKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICBhZGRDaGVja2JveDogZnVuY3Rpb24gKHVuY2hlY2tlZCkge1xyXG4gICAgICB2YXIgZGF5UnUgPSB7IFwibW9uXCI6IFwi0J/QvVwiLCBcInR1ZVwiOiBcItCS0YJcIiwgXCJ3ZWRcIjogXCLQodGAXCIsIFwidGh1XCI6IFwi0KfRglwiLCBcImZyaVwiOiBcItCf0YJcIiwgXCJzYXRcIjogXCLQodCxXCIsIFwic3VuXCI6IFwi0JLRgVwiIH07XHJcbiAgICAgIHZhciBzcGFuID0gYW5ndWxhci5lbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgIGZvcihsZXQgaj0wO2o8dW5jaGVja2VkLmxlbmd0aDsgaisrKXtcclxuICAgICAgICAvLyBmb3IgaW5wdXRcclxuICAgICAgICB2YXIgaW5wdXQgPSBhbmd1bGFyLmVsZW1lbnQoJzxpbnB1dCAvPicpOyBjb25zb2xlLmxvZyhpbnB1dCk7XHJcbiAgICAgICAgdmFyIGlucHV0QXR0ciA9IFsnZm9ybS1jb250cm9sJywgJ2NoZWNrYm94LWRheS1pbnB1dCddO1xyXG4gICAgICAgIGZvcihsZXQgaT0wOyBpPGlucHV0QXR0ci5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICBpbnB1dC5hZGRDbGFzcyhpbnB1dEF0dHJbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBmb3IgaW5wdXRcclxuICAgICAgICAvLyBmb3IgbGFiZWxcclxuICAgICAgICB2YXIgbGFiZWwgPSBhbmd1bGFyLmVsZW1lbnQoJ2xhYmVsJyk7IGNvbnNvbGUubG9nKGxhYmVsKTtcclxuICAgICAgICBsYWJlbC50ZXh0KGRheVJ1W3VuY2hlY2tlZFtqXV0pO1xyXG4gICAgICAgIC8vIGZvciBsYWJlbFxyXG4gICAgICAgIHNwYW4uYXBwZW5kKGxhYmVsKTtcclxuICAgICAgICBzcGFuLmFwcGVuZChpbnB1dCk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gdmFyIHRhcmdldEVsID0gZmluZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2hlY2tib3gnKSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKHRhcmdldEVsKTtcclxuICAgICAgLy8gdGFyZ2V0RWwuYXBwZW5kKHNwYW4pO1xyXG5cclxuICAgIH1cclxuICB9O1xyXG59KTsiXSwiZmlsZSI6ImFwcC9zZWFzb24vc2hlZHVsZS9zZXJ2aWNlLmpzIn0=
