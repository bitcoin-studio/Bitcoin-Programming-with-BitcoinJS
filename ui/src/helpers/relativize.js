'use strict'

const { posix: path } = require('path')

// TODO memoize me
function relativize (to, ctx) {
  let from
  // legacy invocation
  if (arguments.length > 2) {
    [from, to, ctx] = arguments
  } else {
    from = ctx.data.root.page.url
  }
  if (!to) return '#'
  const hashIdx = to.indexOf('#')
  if (!hashIdx) return to
  if (!from) return (ctx.data.root.site.path || '') + to
  let hash = ''
  if (~hashIdx) {
    hash = to.substr(hashIdx)
    to = to.substr(0, hashIdx)
  }
  if (from === to) {
    return hash || (isDir(to) ? './' : path.basename(to))
  } else {
    return path.relative(path.dirname(from + '.'), to) + (isDir(to) ? '/' + hash : hash)
  }
}

function isDir (str) {
  return str.charAt(str.length - 1) === '/'
}

module.exports = relativize
