;(function (Clippy) {
  'use strict'

  function findAncestor (el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls)) {
    }
    return el
  }

  // create a button for each code block with a specified language
  var blocks = document.getElementsByTagName('pre')
  for (var i = 0; i < blocks.length; i++) {
    if (!blocks[i].children.length) {
      continue
    }
    var hasLang = blocks[i].children[0].className.indexOf('language-')
    if (hasLang >= 0) {
      var ancestor = findAncestor(blocks[i], 'listingblock')
      if (!ancestor) {
        continue
      }
      var button = document.createElement('button')
      button.className = 'copy-button'
      button.setAttribute('aria-label', 'Copy to clipboard')
      button.innerHTML = '<svg width="20" height="20" fill="black" ' +
        'viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">' +
        '<path class="q" d="M13.3334 0.833328H3.33341C2.41675 0.833328 ' +
        '1.66675 1.58333 1.66675 2.49999V14.1667H3.33341V2.49999H13.3334' +
        'V0.833328ZM12.5001 4.16666L17.5001 9.16666V17.5C17.5001 18.4167 ' +
        '16.7501 19.1667 15.8334 19.1667H6.65841C5.74175 19.1667 5.00008 ' +
        '18.4167 5.00008 17.5L5.00841 5.83333C5.00841 4.91666 5.75008 ' +
        '4.16666 6.66675 4.16666H12.5001ZM11.6667 9.99999H16.2501' +
        'L11.6667 5.41666V9.99999Z"/></svg>'
      ancestor.appendChild(button)
    }
  }

  // initialize clipboard.js
  var copyCode = new Clippy('.copy-button', {
    target: function (trigger) {
      setTimeout(function () {
        trigger.blur()
      }, 2000)

      var ancestor = findAncestor(trigger, 'listingblock')
      if (!ancestor) {
        return
      }
      return ancestor.querySelector('pre code')
    },
  })

  // hide the text selection if the selection worked
  copyCode.on('success', function (e) {
    e.clearSelection()
  })
})(require('clipboard/dist/clipboard.min'))
