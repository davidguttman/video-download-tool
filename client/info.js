const html = require('nanohtml')
const morph = require('nanomorph')
// const urlParse = require('url-parse')

const state = require('./state')()

const aClass = 'dim hot-pink no-underline'

module.exports = function downloader () {
  const tree = render()
  state.on('*', key => morph(tree, render()))
  return tree
}

function render () {
  return html`
    <div>
      <div class='sans-serif white-90 vh-100 dt w-100'>
        <div class='dtc v-mid tc ph3 ph5-l'>
          ${renderHeader()}
          ${renderInfo()}
        </div>
      </div>
    </div>
  `
}

function renderHeader () {
  return html`
    <div>
      <h1 class='f2 lh-title pink'>Video Download Tool</h1>
    </div>
  `
}

function renderInfo () {
  return html`
    <div class='ma4'>

      <p class='center tracked measure lh-copy ma4 '>
        Video Download Tool makes it easy to download videos, but only the parts you want. Enter a video's url, select the beginning and end of your clip, optionally crop the video frame, and download.
      </p>

      <p class='center tracked measure lh-copy ma4 '>
        To use Video Download Tool you'll want your own <a class=${aClass} target='_blank' href='https://github.com/davidguttman/video-download-tool-server'>server</a> to do the streaming video editing. If you don't have one yet, you can easily create one for a low monthly rate on <a class=${aClass} target='_blank' href='https://cloud.digitalocean.com/apps/new?repo=https://github.com/davidguttman/video-download-tool-server/tree/main&refcode=225b310227ea'>Digital Ocean</a>.
      </p>

      <p class='center tracked measure lh-copy ma4'>
        Once it's set up, visit your server to get started.
      </p>

      <div class='flex items-center justify-center'>
        <a class='pa2 dim' href='https://heroku.com/deploy?template=https://github.com/davidguttman/video-download-tool-server'><img class='h2' src='https://www.herokucdn.com/deploy/button.svg' alt='Deploy' ></a>

        <a class='pa2 dim' href='https://cloud.digitalocean.com/apps/new?repo=https://github.com/davidguttman/video-download-tool-server/tree/main&refcode=225b310227ea'><img class='h2' src='https://www.deploytodo.com/do-btn-white.svg' alt='Deploy' ></a>
      </div>

      <p class='silver center tracked measure lh-copy ma4'>
        Alternatively, if you'd just like to try things out, you can use the <a class=${aClass} href='http://video-download-tool.herokuapp.com'>shared demo server</a> or watch the demo video below.
      </p>

      <p class='silver center tracked measure lh-copy ma4'>
        <iframe width="100%" height="450" src="https://www.youtube.com/embed/4tBGo73NbXM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </p>


      <p class='silver center tracked measure lh-copy ma4'>
        Both the Video Download Tool <a class=${aClass} target='_blank' href='//github.com/davidguttman/video-download-tool'>UI</a> and <a class=${aClass} target='_blank' href='//github.com/davidguttman/video-download-tool-server'>server</a> are open source and are available on Github.
      </p>
    </div>
  `
}
