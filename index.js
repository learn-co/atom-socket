const pagebus = require('page-bus')
const sockets = {}

module.exports = {
  getInstance: (key, url) => {
    if (sockets[url]) {
      return sockets[url]
    } else {
      var socket = new SocketConnection(key, url)
      sockets[url] = socket
      return socket
    }
  }
}

class SocketConnection {
  constructor(key, url) {
    this.key = key
    this.url = url
    this.bus = pagebus({key: this.key})
    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      this.bus.emit('open')
    }

    this.ws.onmessage = (msg) => {
      this.bus.emit('message', msg.data)
    }
  }

  on(event, cb) {
    this.bus.on(event, cb)
  }

  send(msg) {
    this.ws.send(msg)
  }
}
