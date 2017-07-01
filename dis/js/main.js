
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBjb2xsYXBzZS5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jY29sbGFwc2VcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcbi8qIGpzaGludCBsYXRlZGVmOiBmYWxzZSAqL1xyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBDT0xMQVBTRSBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBDb2xsYXBzZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50ICAgICAgPSAkKGVsZW1lbnQpXHJcbiAgICB0aGlzLm9wdGlvbnMgICAgICAgPSAkLmV4dGVuZCh7fSwgQ29sbGFwc2UuREVGQVVMVFMsIG9wdGlvbnMpXHJcbiAgICB0aGlzLiR0cmlnZ2VyICAgICAgPSAkKCdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXVtocmVmPVwiIycgKyBlbGVtZW50LmlkICsgJ1wiXSwnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdW2RhdGEtdGFyZ2V0PVwiIycgKyBlbGVtZW50LmlkICsgJ1wiXScpXHJcbiAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSBudWxsXHJcblxyXG4gICAgaWYgKHRoaXMub3B0aW9ucy5wYXJlbnQpIHtcclxuICAgICAgdGhpcy4kcGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5hZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3ModGhpcy4kZWxlbWVudCwgdGhpcy4kdHJpZ2dlcilcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5vcHRpb25zLnRvZ2dsZSkgdGhpcy50b2dnbGUoKVxyXG4gIH1cclxuXHJcbiAgQ29sbGFwc2UuVkVSU0lPTiAgPSAnMy4zLjcnXHJcblxyXG4gIENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04gPSAzNTBcclxuXHJcbiAgQ29sbGFwc2UuREVGQVVMVFMgPSB7XHJcbiAgICB0b2dnbGU6IHRydWVcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS5kaW1lbnNpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgaGFzV2lkdGggPSB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCd3aWR0aCcpXHJcbiAgICByZXR1cm4gaGFzV2lkdGggPyAnd2lkdGgnIDogJ2hlaWdodCdcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMudHJhbnNpdGlvbmluZyB8fCB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpbicpKSByZXR1cm5cclxuXHJcbiAgICB2YXIgYWN0aXZlc0RhdGFcclxuICAgIHZhciBhY3RpdmVzID0gdGhpcy4kcGFyZW50ICYmIHRoaXMuJHBhcmVudC5jaGlsZHJlbignLnBhbmVsJykuY2hpbGRyZW4oJy5pbiwgLmNvbGxhcHNpbmcnKVxyXG5cclxuICAgIGlmIChhY3RpdmVzICYmIGFjdGl2ZXMubGVuZ3RoKSB7XHJcbiAgICAgIGFjdGl2ZXNEYXRhID0gYWN0aXZlcy5kYXRhKCdicy5jb2xsYXBzZScpXHJcbiAgICAgIGlmIChhY3RpdmVzRGF0YSAmJiBhY3RpdmVzRGF0YS50cmFuc2l0aW9uaW5nKSByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc3RhcnRFdmVudCA9ICQuRXZlbnQoJ3Nob3cuYnMuY29sbGFwc2UnKVxyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKHN0YXJ0RXZlbnQpXHJcbiAgICBpZiAoc3RhcnRFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgaWYgKGFjdGl2ZXMgJiYgYWN0aXZlcy5sZW5ndGgpIHtcclxuICAgICAgUGx1Z2luLmNhbGwoYWN0aXZlcywgJ2hpZGUnKVxyXG4gICAgICBhY3RpdmVzRGF0YSB8fCBhY3RpdmVzLmRhdGEoJ2JzLmNvbGxhcHNlJywgbnVsbClcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZGltZW5zaW9uID0gdGhpcy5kaW1lbnNpb24oKVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzZScpXHJcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpW2RpbWVuc2lvbl0oMClcclxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxyXG5cclxuICAgIHRoaXMuJHRyaWdnZXJcclxuICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzZWQnKVxyXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXHJcblxyXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMVxyXG5cclxuICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2luZycpXHJcbiAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZSBpbicpW2RpbWVuc2lvbl0oJycpXHJcbiAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDBcclxuICAgICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAgIC50cmlnZ2VyKCdzaG93bi5icy5jb2xsYXBzZScpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuIGNvbXBsZXRlLmNhbGwodGhpcylcclxuXHJcbiAgICB2YXIgc2Nyb2xsU2l6ZSA9ICQuY2FtZWxDYXNlKFsnc2Nyb2xsJywgZGltZW5zaW9uXS5qb2luKCctJykpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCAkLnByb3h5KGNvbXBsZXRlLCB0aGlzKSlcclxuICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04pW2RpbWVuc2lvbl0odGhpcy4kZWxlbWVudFswXVtzY3JvbGxTaXplXSlcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMudHJhbnNpdGlvbmluZyB8fCAhdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSkgcmV0dXJuXHJcblxyXG4gICAgdmFyIHN0YXJ0RXZlbnQgPSAkLkV2ZW50KCdoaWRlLmJzLmNvbGxhcHNlJylcclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzdGFydEV2ZW50KVxyXG4gICAgaWYgKHN0YXJ0RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgIHZhciBkaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbigpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudFtkaW1lbnNpb25dKHRoaXMuJGVsZW1lbnRbZGltZW5zaW9uXSgpKVswXS5vZmZzZXRIZWlnaHRcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpXHJcbiAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2UgaW4nKVxyXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxyXG5cclxuICAgIHRoaXMuJHRyaWdnZXJcclxuICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZWQnKVxyXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxyXG5cclxuICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDFcclxuXHJcbiAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDBcclxuICAgICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2luZycpXHJcbiAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZScpXHJcbiAgICAgICAgLnRyaWdnZXIoJ2hpZGRlbi5icy5jb2xsYXBzZScpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuIGNvbXBsZXRlLmNhbGwodGhpcylcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgIFtkaW1lbnNpb25dKDApXHJcbiAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsICQucHJveHkoY29tcGxldGUsIHRoaXMpKVxyXG4gICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoQ29sbGFwc2UuVFJBTlNJVElPTl9EVVJBVElPTilcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzW3RoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykgPyAnaGlkZScgOiAnc2hvdyddKClcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS5nZXRQYXJlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gJCh0aGlzLm9wdGlvbnMucGFyZW50KVxyXG4gICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl1bZGF0YS1wYXJlbnQ9XCInICsgdGhpcy5vcHRpb25zLnBhcmVudCArICdcIl0nKVxyXG4gICAgICAuZWFjaCgkLnByb3h5KGZ1bmN0aW9uIChpLCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KVxyXG4gICAgICAgIHRoaXMuYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzKGdldFRhcmdldEZyb21UcmlnZ2VyKCRlbGVtZW50KSwgJGVsZW1lbnQpXHJcbiAgICAgIH0sIHRoaXMpKVxyXG4gICAgICAuZW5kKClcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS5hZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3MgPSBmdW5jdGlvbiAoJGVsZW1lbnQsICR0cmlnZ2VyKSB7XHJcbiAgICB2YXIgaXNPcGVuID0gJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJylcclxuXHJcbiAgICAkZWxlbWVudC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgaXNPcGVuKVxyXG4gICAgJHRyaWdnZXJcclxuICAgICAgLnRvZ2dsZUNsYXNzKCdjb2xsYXBzZWQnLCAhaXNPcGVuKVxyXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGlzT3BlbilcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFRhcmdldEZyb21UcmlnZ2VyKCR0cmlnZ2VyKSB7XHJcbiAgICB2YXIgaHJlZlxyXG4gICAgdmFyIHRhcmdldCA9ICR0cmlnZ2VyLmF0dHIoJ2RhdGEtdGFyZ2V0JylcclxuICAgICAgfHwgKGhyZWYgPSAkdHJpZ2dlci5hdHRyKCdocmVmJykpICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpIC8vIHN0cmlwIGZvciBpZTdcclxuXHJcbiAgICByZXR1cm4gJCh0YXJnZXQpXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQ09MTEFQU0UgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMuY29sbGFwc2UnKVxyXG4gICAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBDb2xsYXBzZS5ERUZBVUxUUywgJHRoaXMuZGF0YSgpLCB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvbilcclxuXHJcbiAgICAgIGlmICghZGF0YSAmJiBvcHRpb25zLnRvZ2dsZSAmJiAvc2hvd3xoaWRlLy50ZXN0KG9wdGlvbikpIG9wdGlvbnMudG9nZ2xlID0gZmFsc2VcclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5jb2xsYXBzZScsIChkYXRhID0gbmV3IENvbGxhcHNlKHRoaXMsIG9wdGlvbnMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4uY29sbGFwc2VcclxuXHJcbiAgJC5mbi5jb2xsYXBzZSAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4uY29sbGFwc2UuQ29uc3RydWN0b3IgPSBDb2xsYXBzZVxyXG5cclxuXHJcbiAgLy8gQ09MTEFQU0UgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLmNvbGxhcHNlLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLmNvbGxhcHNlID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIENPTExBUFNFIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmJzLmNvbGxhcHNlLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG5cclxuICAgIGlmICghJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKSkgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICAgdmFyICR0YXJnZXQgPSBnZXRUYXJnZXRGcm9tVHJpZ2dlcigkdGhpcylcclxuICAgIHZhciBkYXRhICAgID0gJHRhcmdldC5kYXRhKCdicy5jb2xsYXBzZScpXHJcbiAgICB2YXIgb3B0aW9uICA9IGRhdGEgPyAndG9nZ2xlJyA6ICR0aGlzLmRhdGEoKVxyXG5cclxuICAgIFBsdWdpbi5jYWxsKCR0YXJnZXQsIG9wdGlvbilcclxuICB9KVxyXG5cclxufShqUXVlcnkpO1xyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiB0cmFuc2l0aW9uLmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0cmFuc2l0aW9uc1xyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gQ1NTIFRSQU5TSVRJT04gU1VQUE9SVCAoU2hvdXRvdXQ6IGh0dHA6Ly93d3cubW9kZXJuaXpyLmNvbS8pXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIHRyYW5zaXRpb25FbmQoKSB7XHJcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdib290c3RyYXAnKVxyXG5cclxuICAgIHZhciB0cmFuc0VuZEV2ZW50TmFtZXMgPSB7XHJcbiAgICAgIFdlYmtpdFRyYW5zaXRpb24gOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXHJcbiAgICAgIE1velRyYW5zaXRpb24gICAgOiAndHJhbnNpdGlvbmVuZCcsXHJcbiAgICAgIE9UcmFuc2l0aW9uICAgICAgOiAnb1RyYW5zaXRpb25FbmQgb3RyYW5zaXRpb25lbmQnLFxyXG4gICAgICB0cmFuc2l0aW9uICAgICAgIDogJ3RyYW5zaXRpb25lbmQnXHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgbmFtZSBpbiB0cmFuc0VuZEV2ZW50TmFtZXMpIHtcclxuICAgICAgaWYgKGVsLnN0eWxlW25hbWVdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4geyBlbmQ6IHRyYW5zRW5kRXZlbnROYW1lc1tuYW1lXSB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2UgLy8gZXhwbGljaXQgZm9yIGllOCAoICAuXy4pXHJcbiAgfVxyXG5cclxuICAvLyBodHRwOi8vYmxvZy5hbGV4bWFjY2F3LmNvbS9jc3MtdHJhbnNpdGlvbnNcclxuICAkLmZuLmVtdWxhdGVUcmFuc2l0aW9uRW5kID0gZnVuY3Rpb24gKGR1cmF0aW9uKSB7XHJcbiAgICB2YXIgY2FsbGVkID0gZmFsc2VcclxuICAgIHZhciAkZWwgPSB0aGlzXHJcbiAgICAkKHRoaXMpLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgZnVuY3Rpb24gKCkgeyBjYWxsZWQgPSB0cnVlIH0pXHJcbiAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7IGlmICghY2FsbGVkKSAkKCRlbCkudHJpZ2dlcigkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQpIH1cclxuICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIGR1cmF0aW9uKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gICQoZnVuY3Rpb24gKCkge1xyXG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gPSB0cmFuc2l0aW9uRW5kKClcclxuXHJcbiAgICBpZiAoISQuc3VwcG9ydC50cmFuc2l0aW9uKSByZXR1cm5cclxuXHJcbiAgICAkLmV2ZW50LnNwZWNpYWwuYnNUcmFuc2l0aW9uRW5kID0ge1xyXG4gICAgICBiaW5kVHlwZTogJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLFxyXG4gICAgICBkZWxlZ2F0ZVR5cGU6ICQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxcclxuICAgICAgaGFuZGxlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGlmICgkKGUudGFyZ2V0KS5pcyh0aGlzKSkgcmV0dXJuIGUuaGFuZGxlT2JqLmhhbmRsZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSlcclxuXHJcbn0oalF1ZXJ5KTsiXSwiZmlsZSI6Im1haW4uanMifQ==
