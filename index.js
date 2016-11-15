const path = require('path')
const bus = require('page-bus')()
const chunker = require('./chunker')

// Atom API
const {BrowserWindow} = require('electron').remote

const sockets = {}

var wsWindow

const waitForWSManager = new Promise((resolve, reject) => {
  bus.on('manager:ready', resolve)
})

var isManagerRunning = BrowserWindow.getAllWindows().map((win) => {
  return win.getTitle()
}).indexOf(localStorage.getItem('atom-socket:running')) > -1

if (!isManagerRunning) {
  var id = Date.now().toString()
  localStorage.setItem('atom-socket:running', id)
  wsWindow = new BrowserWindow({title: id, webPreferences: {devTools: true}})
  wsWindow.loadURL(`file://${ path.join(__dirname, 'websocket.html') }`)
  wsWindow.webContents.openDevTools()
}

module.exports = class AtomSocket {
  constructor(key, url) {
    this.key = key
    this.url = url
    this.debuggerOpen = false
    this.chunkBuffer = {}

    bus.on('open:debugger', () => {
      if (wsWindow) {
        wsWindow.show()
      }

      this.debuggerOpen = true
    })

    bus.on('close:debugger', () => {
      if (wsWindow) {
        wsWindow.hide()
      }

      this.debuggerOpen = false
    })

    waitForWSManager.then(() => {
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
    if (this.debuggerOpen) {
      this.closeDebugger()
    } else {
      this.openDebugger()
    }
  }

  openDebugger() {
    bus.emit('open:debugger')
  }

  closeDebugger() {
    bus.emit('close:debugger')
  }
}
