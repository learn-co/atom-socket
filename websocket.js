const bus = require('page-bus')()
const websockets = {}
const managers = []
const chunkBuffer = {}
const chunker = require('./chunker')

require('./debugger')

bus.on('websocket:manager:start', ({pid, time}) => {
  managers.push({pid: pid, time: time})
})

bus.emit('websocket:manager:start', {pid: process.pid, time: Date.now()})

setTimeout(() => {
  if (managers.length > 1) {
    window.close()
    return process.exit(0)
  } else {
    setInterval(() => {
      bus.emit('manager:ready')
    }, 1000)
  }

  window.onbeforeunload = () => {
    localStorage.removeItem('atom-socket:running')
  }

  getSocket = (key, url) => {
    var ws = new WebSocket(url)
    websockets[key] = ws

    ws.onopen = () => {
      log({key: key, event: 'open'})
      bus.emit(`${key}:open`)
    }

    ws.onmessage = (msg) => {
      if (msg.data.length > chunker.CHUNK_SIZE) {
        log({key: key, event: 'message:chunked'})
        chunker.sendChunked(`${key}:message`, msg.data)
      } else {
        log({key: key, event: 'message', data: msg.data})
        bus.emit(`${key}:message`, msg.data)
      }
    }

    ws.onerror = (err) => {
      delete websockets[key]
      log({key: key, event: 'error', error: err})
      bus.emit(`${key}:error`, err)
    }

    ws.onclose = () => {
      delete websockets[key]
      log({key: key, event: 'close'})
      bus.emit(`${key}:close`)
    }

    return ws
  }

  bus.on('create', ({key, url}) => {
    log({key: key, event: 'create'})
    if (websockets[key]) {
      log({key: key, event: 'cached'})
      bus.emit(`${key}:open:cached`)
    } else {
      log({key: key, event: 'uncached'})

      var ws = getSocket(key, url)

      bus.on(`${key}:send`, (msg) => {
        log({key: key, event: 'send', data: msg})
        ws.send(msg)
      })

      chunker.onChunked(`${key}:send`, (msg) => {
        log({key: key, event: 'send:chunked'})
        ws.send(msg)
      })

      bus.on(`${key}:close:request`, () => {
        log({key: key, event: 'closing'})
        ws.close()
      })

      bus.on(`${key}:reset:request`, () => {
        log({key: key, event: 'reset'})
        ws.close()
        ws = getSocket(key, url)
      })
    }
  })
}, 1000)
