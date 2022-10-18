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

  tippy('.quicklink.quicklink__bug', {
    content: 'Report issue',
    placement: 'top-start',
    theme: 'custom',
    animation: 'fade',
    duration: [300, 300],
  })

  tippy('.quicklink.quicklink__edit', {
    content: 'Edit page',
    placement: 'top-start',
    theme: 'custom',
    animation: 'fade',
    duration: [300, 300],
  })

  tippy('.quicklink.quicklink__code', {
    content: 'Show me the code',
    placement: 'top-start',
    theme: 'custom',
    animation: 'fade',
    duration: [300, 300],
  })
})()
