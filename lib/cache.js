const WebSocket = require('./websocket')

module.exports = class WebSocketCache {
  constructor() {
    this.websockets = {}
  }

  createWebSocket(key, url, opts) {
    console.log(`creating new websocket for ${key}: ${url}`)

    if (this.hasWebSocket(key)) {
      console.warn(`found websocket for ${key} in cache, will replace it`)
      this.getWebSocket(key).clean()
    }

    this.websockets[key] = new WebSocket(url, Object.assign(opts, {key}))
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
    this.createWebSocket(key, ws.url, ws.options)

    ws.clean()
    ws.close()
  }

  resetAll() {
    console.log('resetting all websockets')
    for (var key in this.websockets) {
      if (this.websockets.hasOwnProperty(key)) { this.resetWebSocket(key) }
    }
  }
}

