const html = require('nanohtml')
const morph = require('nanomorph')
const urlParse = require('url-parse')

const api = require('./api')
const state = require('./state')()
const ffmpeg = require('./ffmpeg')
const { toTimeStr } = require('./util')

const initialState = {
  // debug: true,
  isLoading: false,
  title: '',
  url: '',
  cropMode: false,
  crop: {},
  duration: 0,
  currentTime: 0,
  ytUrl: '',
  reduceVolume: false,
  secsStart: 0,
  secsEnd: 0,
  formats: [],
  format: null,
  showFormats: false
}

const video = require('./video')({
  onCrop: crop => state.set('crop', crop),
  onDuration: duration => state.set('duration', duration),
  onTimeUpdate: currentTime => state.set('currentTime', currentTime)
})

module.exports = function downloader (apiHost) {
  state.set({ ...initialState, apiHost })
  const tree = render()
  state.on('*', key => key !== 'currentTime' && morph(tree, render()))
  return tree
}

// state.set('ytUrl', 'https://www.youtube.com/watch?v=RZNouTawJ28')
// onYTLoad()

function render () {
  return html`
  <div>
    <div class='sans-serif white-90 vh-75 dt w-100'>
      <div class='dtc v-mid tc ph3 ph5-l'>
        ${renderHeader()}
        ${renderInput()}
        ${renderDisplay()}
        ${renderActions()}
        ${renderDebug()}
      </div>
    </div>
    <div class='sans-serif white-90 vh-25 dt w-100'>
      <div class='dtc v-btm tc ph3 ph5-l'>
        ${renderServer()}
      </div>
    </div>
  </div>`
}

function renderHeader () {
  return html`
    <div>
      <h1 class='f2 lh-title pink'>Video Download Tool</h1>
    </div>
  `
}

function renderInput () {
  const btnClass = 'f6 grow br-pill ph3 pv2 mb2 dib white bg-hot-pink no-underline pointer ba b--black-20 hover-bg-pink'
  return html`
    <div class='mv4 ${state.isLoading || state.url ? 'dn' : ''}'>
      <form action='#' onsubmit=${onYTLoad}>
        <label class='white-90'>

          <input
            type='text'
            placeholder='https://www.youtube.com/watch?v=...'
            class='tc input-reset bg-dark-gray white-90 w-70 pa2 ba b--black-20 mr3'
            onchange=${onYTUrlChange} />
        </label>
        <button class=${btnClass} type='submit'>Load</button>
      </form>
    </div>
  `
}

function renderActions () {
  const btnClass = 'f6 grow br-pill ph3 pv2 mb2 mr2 dib white bg-hot-pink no-underline pointer hover-bg-pink'

  const ffOpts = ffmpegOpts()

  const downloadUrl = ffOpts
    ? api.getDownloadUrl(state.apiHost, { title: state.title, args: ffmpeg.getArgs(ffOpts) })
    : state.url

  return html`
    <div class='mv3 tc' style=${!state.url ? 'display: none' : ''}>
      <div class='center'>
        <a class=${btnClass} onclick=${setStart}>
          ${state.secsStart && state.secsStart !== 0
    ? `Start: ${toTimeStr(state.secsStart)}`
    : 'Set Start Time'}
        </a>
        <a class=${btnClass} onclick=${setEnd}>
          ${state.secsEnd && state.secsEnd !== state.duration ? `End: ${toTimeStr(state.secsEnd)}` : 'Set End Time'}
        </a>
        <a class=${btnClass} onclick=${toggleCrop}>
          ${state.cropMode ? 'Show Controls' : 'Crop'}
        </a>
        <a class=${btnClass} onclick=${toggleReduceVolume}>
          Reduce Volume ${state.reduceVolume ? '\u2611' : '\u2610'}
        </a>
        <a
          class=${btnClass}
          href=${downloadUrl}>
          Download
        </a>
      </div>
    </div>
  `
}

function renderDisplay () {
  return html`

    <div>
      ${renderLoader()}
      ${renderMeta()}
      <div class='${!state.url ? 'dn' : ''}'>
        ${video.el}
      </div>
    </div>
  `
}

function renderMeta () {
  // ▼ ◀
  if (!state.title || !state.formats.length) return blank()

  return html`
    <div class='flex justify-between items-center mb2'>
      <h2 class='f4 white w-75 tl'>${state.title}</h2>
      <div class='tr'>
        <a class='gray pb1 pointer' onclick=${onToggleShowFormats}>
          ${state.formats.length} Formats ${state.showFormats
    ? '\u25BC'
    : '\u25C0'}
        </a>
        <div class=${!state.showFormats ? 'dn' : ''}>
          ${state.formats.map(renderFormat)}
        </div>
      </div>

    </div>
  `
}

function renderFormat (format) {
  const selectedFormat = state.format || {}

  return html`
    <div>
      <a class='pointer hover-hot-pink' onclick=${() => onSelectFormat(format)}>
        <span class='hot-pink'>
          ${selectedFormat.format_note === format.format_note ? '\u2713 ' : ''}
        </span>
        ${format.format_note}
      </a>
    </div>
  `
}

function renderLoader () {
  if (!state.isLoading) return blank()

  return html`
    <div class='flex items-center justify-center h5'>
      <div class='loader-inner ball-scale-ripple-multiple'>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  `
}

function renderDebug () {
  if (!state.debug || !state.url) return blank()

  return html`
    <div>
      <textarea
        class='code input-reset bg-dark-gray white-80 w-100 pa2 ba b--black-20 h5'>
        ${'ffmpeg ' + ffmpeg.getArgs({ cli: true, ...ffmpegOpts() }).join(' ')}
      </textarea>
    </div>
  `
}

function renderServer () {
  return html`
    <div>
      <p class='gray tc mt5 f6'>
        You are currently using the <a class='pink pointer dim no-underline' href='https://${state.apiHost}'>${state.apiHost}</a> server.
        <br />
        If you'd prefer to use a different server, you may <a class='pink pointer dim' onclick=${disconnect}>disconnect</a>.
      </p>
    </div>
  `
}

function onYTUrlChange (evt) {
  const orig = evt.target.value
  const parsed = urlParse(orig, true)
  parsed.set('query', { v: parsed.query.v })
  state.set('ytUrl', parsed.href)
}

function onYTLoad (evt) {
  evt && evt.preventDefault()

  if (!state.ytUrl) return

  state.set('isLoading', true)
  api.getFormats(state.apiHost, state.ytUrl).then(meta => {
    const format = meta.formats[0]

    state.set('title', meta.title)
    state.set('formats', meta.formats)
    state.set('format', format)
    state.set('url', format.url)
    state.set('isLoading', false)

    video.updateUrl(format.url)
  })
}

function onToggleShowFormats () {
  state.set('showFormats', !state.showFormats)
}

function onSelectFormat (format) {
  state.set('format', format)
  state.set('url', format.url)
  video.updateUrl(format.url)
  video.resetCrop()
}

function ffmpegOpts () {
  const anyMods = state.secsStart ||
    state.secsEnd ||
    state.crop.width ||
    state.crop.height ||
    state.reduceVolume

  if (!anyMods) return false

  return {
    url: state.url,
    title: state.title,
    timeStart: toTimeStr(state.secsStart),
    duration: toTimeStr((state.secsEnd || state.duration) - state.secsStart),
    width: state.crop.width,
    height: state.crop.height,
    xOffset: state.crop.xOffset,
    reduceVolume: state.reduceVolume,
    yOffset: state.crop.yOffset
  }
}

function toggleCrop () {
  state.set('cropMode', !state.cropMode)
  state.cropMode ? video.showCrop() : video.hideCrop()
}

function toggleReduceVolume () {
  state.set('reduceVolume', !state.reduceVolume)
}

function setStart () {
  state.set('secsStart', state.currentTime)
  if (state.secsEnd < state.secsStart) state.set('secsEnd', state.duration)
}

function setEnd () {
  state.set('secsEnd', state.currentTime)
  if (state.secsStart > state.secsEnd) state.set('secsStart', 0)
}

function blank () {
  return html`<span />`
}

function disconnect () {
  window.localStorage.clear()
  setTimeout(function () {
    window.location = '/'
  })
}
