const pagebus = require('page-bus')
const bus = pagebus()
const sockets = {}
const path = require('path')
const remote = require('remote')
const BrowserWindow = remote.require('browser-window')

if (!localStorage.getItem('socket:drawer:running')) {
  localStorage.setItem('socket:drawer:running', process.pid)
  var wsWindow = new BrowserWindow({webPreferences: {devTools: true}})
  wsWindow.loadURL(`file://${ path.join(__dirname, 'websocket.html') }`)
  wsWindow.webContents.openDevTools()
}

module.exports =
class SocketConnection {
  constructor(key, url) {
    this.key = key
    this.url = url
    bus.emit('create', {key: this.key, url: this.url})
  }

  on(event, cb) {
    bus.on(`${this.key}:${event}`, cb)
  }

  send(msg) {
    bus.emit(`${this.key}:send`, msg)
  }
}
