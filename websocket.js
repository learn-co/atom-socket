const bus = require('page-bus')()
const websockets = {}
const managers = []
const chunkBuffer = {}
const chunker = require('./chunker')
const ReconnectingWebSocket = require('learn-reconnecting-websocket')

const refreshAll = () => {
  for (key in websockets) {
    if (websockets.hasOwnProperty(key)) {
      websockets[key].open()
    }
  }
}

console.log(`current process is ${process.pid}`)

bus.on('websocket:manager:start', ({pid, time}) => {
  console.log(`process ${pid} started at ${time}`)
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
    window.removeEventListener('offline', refreshAll)
    window.removeEventListener('online', refreshAll)
  }

  window.addEventListener('offline', refreshAll)
  window.addEventListener('online', refreshAll)

  getSocket = (key, url) => {
    var ws = new ReconnectingWebSocket(url, null, {timeoutInterval: 5000})
    websockets[key] = ws

    ws.onopen = () => {
      console.log(`websocket open for ${key}: ${url}`)
      bus.emit(`${key}:open`)
    }

    ws.onmessage = (msg) => {
      parsed = JSON.parse(msg.data)
      key = parsed.topic
      payload = parsed.payload

      if (payload.length > chunker.CHUNK_SIZE) {
        chunker.sendChunked(`${key}:message`, payload)
      } else {
        console.log(`received message for ${key}: ${url}`, payload)
        bus.emit(`${key}:message`, payload)
      }
    }

    ws.onerror = (err) => {
      console.log(`error for ${key}: ${url}`, err)
      bus.emit(`${key}:error`, err)
    }

    ws.onclose = () => {
      console.log(`websocket close for ${key}: ${url}`)
      bus.emit(`${key}:close`)
    }

    return ws
  }

  bus.on('create', ({key, url}) => {
    console.log(`received request for ${key}: ${url}`)
    if (websockets[key]) {
      console.log(`found websocket from cache for ${key}: ${url}`)
      bus.emit(`${key}:open:cached`)
    } else {
      console.log(`creating new websocket for ${key}: ${url}`)

      var ws = getSocket(key, url)

      send = (msg) => {
        var data = JSON.stringify({topic: key, payload: msg})
        ws.send(data)
      }

      bus.on(`${key}:send`, (msg) => {
        console.log(`sending message for ${key}: ${url}`, msg)
        send(msg)
      })

      chunker.onChunked(`${key}:send`, (msg) => {
        send(msg)
      })

      bus.on(`${key}:close:request`, () => {
        console.log(`closing websocket for ${key}: ${url}`)
        ws.close()
      })

      bus.on(`${key}:reset:request`, () => {
        console.log(`resetting websocket for ${key}: ${url}`)
        ws.refresh()
      })
    }
  })
}, 1000)
