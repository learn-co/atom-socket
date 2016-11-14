const path = require('path')
const bus = require('page-bus')()

// Atom API
const remote = require('remote')
const BrowserWindow = remote.require('browser-window')

const sockets = {}

if (!localStorage.getItem('socket:drawer:running')) {
  localStorage.setItem('socket:drawer:running', process.pid)
  var wsWindow = new BrowserWindow({show: false, webPreferences: {devTools: true}})
  wsWindow.loadURL(`file://${ path.join(__dirname, 'websocket.html') }`)
  wsWindow.webContents.openDevTools()
}

module.exports = class AtomSocket {
  constructor(key, url) {
    this.key = key
    this.url = url
    bus.emit('create', {key: this.key, url: this.url, time: Date.now()})
  }

  on(event, cb) {
    bus.on(`${this.key}:${event}`, cb)
  }

  send(msg) {
    bus.emit(`${this.key}:send`, msg)
  }

  close() {
    bus.emit(`${this.key}:close:request`)
  }

  reset() {
    bus.emit(`${this.key}:reset:request`)
  }
}
