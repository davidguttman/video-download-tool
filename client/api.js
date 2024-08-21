module.exports = { getFormats, getDownloadUrl }

function getFormats (apiHost, ytUrl) {
  const urlMeta = `//${apiHost}/video?ytUrl=${encodeURIComponent(ytUrl)}`

  return window
    .fetch(urlMeta)
    .then(res => res.json())
    .then(meta => {
      meta.formats = meta.formats.filter(function (f) {
        return f.ext === 'mp4' && f.acodec !== 'none'
      })

      return meta
    })
}

function getDownloadUrl (apiHost, { title, args }) {
  const filename = encodeURIComponent(title + '.mkv')
  const argsQuery = encodeURIComponent(args.join(','))
  return `//${apiHost}/ffmpeg?filename=${filename}&args=${argsQuery}`
}
