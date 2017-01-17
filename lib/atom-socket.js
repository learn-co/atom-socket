const bus = require('page-bus')()
const chunker = require('./chunker')
const initializer = require('./initializer')

initializer.openRelayWindow()

module.exports = class AtomSocket {
  constructor(key, url) {
    this.key = key
    this.url = url

    initializer.onReady(() => {
      bus.emit('create', {key: this.key, url: this.url, time: Date.now()})
    })
  }

  on(event, cb) {
    if (event === 'message') {
      chunker.onChunked(`${this.key}:message`, cb)
    }

    bus.on(`${this.key}:${event}`, cb)
  }

  send(msg) {
    if (msg.length > chunker.CHUNK_SIZE) {
      chunker.sendChunked(`${this.key}:send`, msg)
    } else {
      bus.emit(`${this.key}:send`, msg)
    }
  }

  close() {
    bus.emit(`${this.key}:close:request`)
  }

  reset() {
    bus.emit(`${this.key}:reset:request`)
  }

  toggleDebugger() {
    initializer.toggleRelayWindowVisibility()
  }
}
