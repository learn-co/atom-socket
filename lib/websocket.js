const bus = require('page-bus')()
const chunker = require('./chunker')

module.exports = class WS {
  constructor(url, key) {
    var ws = new WebSocket(url)

    ws.onopen = () => {
      console.log(`websocket open for ${key}: ${url}`)
      bus.emit(`${key}:open`)
    }

    ws.onmessage = (msg) => {
      if (msg.data.length > chunker.CHUNK_SIZE) {
        chunker.sendChunked(`${key}:message`, msg.data)
      } else {
        console.log(`received message for ${key}: ${url}`, msg.data)
        bus.emit(`${key}:message`, msg.data)
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
}

