const bus = require('page-bus')()

module.exports = class WebSocketCache {
  constructor() {
    this.websockets = {}
  }

  createWebSocket(key, url) {
    console.log(`creating new websocket for ${key}: ${url}`)

    if (this.hasWebSocket(key)) {
      console.warn(`found websocket for ${key} in cache, will replace it`)
    }

    var ws = this.websockets[key] = new WebSocket(url)

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
      this.destroyWebSocket(key)
    }
  }

  getWebSocket(key) {
    if (!this.hasWebSocket(key)) {
      throw Error(`Unable to find websocket with key '${key}'`)
    }

    return this.websockets[key]
  }

  hasWebSocket(key) {
    return !!this.websockets[key]
  }

  resetWebSocket(key) {
    // TODO: review how this effects the server, may need a timeout
    var ws = this.getWebSocket(key)
    this.createWebSocket(key, ws.url)

    ws.onerror = null
    ws.onclose = null
    ws.close()
  }

  destroyWebSocket(key) {
    this.getWebSocket(key).close()
    delete this.websockets[key]
  }

  resetAll() {
    console.log('resetting all websockets')
    for (var key in this.websockets) {
      if (this.websockets.hasOwnProperty(key)) { this.resetWebSocket(key) }
    }
  }
}

