const bus = require('page-bus')()
const chunker = require('./chunker')

module.exports = class WS {
  constructor(url, key) {
    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      console.log(`websocket open for ${key}: ${url}`)
      bus.emit(`${key}:open`)
    }

    this.ws.onmessage = (msg) => {
      if (msg.data.length > chunker.CHUNK_SIZE) {
        chunker.sendChunked(`${key}:message`, msg.data)
      } else {
        console.log(`received message for ${key}: ${url}`, msg.data)
        bus.emit(`${key}:message`, msg.data)
      }
    }

    this.ws.onerror = (err) => {
      console.log(`error for ${key}: ${url}`, err)
      bus.emit(`${key}:error`, err)
    }

    this.ws.onclose = () => {
      console.log(`websocket close for ${key}: ${url}`)
      bus.emit(`${key}:close`)
    }
  }

  send(data) {
    return this.ws.send(data)
  }

  close(code, reason) {
    return this.ws.close(code, reason)
  }

  get url() {
    return this.ws.url
  }

  removeCallbacks() {
    this.ws.onopen = null
    this.ws.onclose = null
    this.ws.onerror = null
    this.ws.onmessage = null
  }
}

