const path = require('path')
const bus = require('page-bus')()

// Atom API
const remote = require('remote')
const BrowserWindow = remote.require('browser-window')

const sockets = {}

getWebsocketManager = () => {
  var wsManager

  if (!localStorage.getItem('socket:drawer:running')) {
    localStorage.setItem('socket:drawer:running', 'booting')
    wsManager = new BrowserWindow({show: false, webPreferences: {devTools: true}})
    wsManager.loadURL(`file://${ path.join(__dirname, 'websocket.html') }`)
    wsManager.webContents.openDevTools()
  } else {
    var pid = localStorage.getItem('socket:drawer:running')
    console.log('pid', pid)
    wsManager = BrowserWindow.getFocusedWindow(pid)
  }

  return wsManager
}

getWebsocketManager()

module.exports = class SocketDrawer {
  constructor(key, url) {
    this._show = false
    this.key = key
    this.url = url
    bus.emit('create', {key: this.key, url: this.url, time: Date.now()})
    bus.on('hide', () => { this.hide() })
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

  toggle() {
    if (this._show) {
      this.hide()
    } else {
      this.show()
    }
  }

  show() {
    this._show = true
    getWebsocketManager().show()
  }

  hide() {
    this._show = false
    getWebsocketManager().hide()
  }
}
