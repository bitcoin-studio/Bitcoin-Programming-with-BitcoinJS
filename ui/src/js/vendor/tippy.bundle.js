;(function () {
  'use strict'

  tippy('.copy-button', {
    content: 'Copied!',
    trigger: 'click',
    placement: 'top-start',
    theme: 'custom',
    animation: 'fade',
    duration: [300, 300],
    onShow: function (i) {
      setTimeout(function () {
        i.hide()
      }, 1000)
    }
  })
})()
