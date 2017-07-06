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