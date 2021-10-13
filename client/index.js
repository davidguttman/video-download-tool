const urlParse = require('url-parse')

require('./style')
const info = require('./info')
const downloader = require('./downloader')

document.title = 'Video Download Tool'

start()

function start () {
  const parsed = urlParse(window.location.href, true)
  const vdtsHost = parsed.query.host || window.localStorage.vdtsHost

  if (vdtsHost) window.localStorage.vdtsHost = vdtsHost

  const el = vdtsHost ? downloader(normalize(vdtsHost)) : info()

  document.body.appendChild(el)
}

function normalize (url) {
  return urlParse('https://' + url.replace(/^https?:\/\//, '')).host
}
