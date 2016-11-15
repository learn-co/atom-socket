const path = require('path')
const bus = require('page-bus')()
const chunk = require('./chunk')

// Atom API
const remote = require('remote')
const BrowserWindow = remote.require('browser-window')

const sockets = {}

var wsWindow

const waitForWSManager = new Promise((resolve, reject) => {
  bus.on('manager:ready', resolve)
})

if (!localStorage.getItem('atom-socket:running')) {
  localStorage.setItem('atom-socket:running', process.pid)
  wsWindow = new BrowserWindow({webPreferences: {devTools: true}})
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
      console.log('waited for manager', this.url)
      bus.emit('create', {key: this.key, url: this.url, time: Date.now()})
    })
  }

  on(event, cb) {
    if (event === 'message') {
      bus.on(`${this.key}:message:chunk`, ({id, chunk}) => {
        this.chunkBuffer[id] || (this.chunkBuffer[id] = '')
        this.chunkBuffer[id] = this.chunkBuffer[id] + chunk
      })

      bus.on(`${this.key}:message:chunk:done`, (id) => {
        cb(this.chunkBuffer[id])
        delete this.chunkBuffer[id]
      })
    }

    bus.on(`${this.key}:${event}`, cb)
  }

  send(msg) {
    console.log('attempting to send', msg.length)

    if (msg.length > chunk.SIZE) {
      var id = Date.now()
      chunk(msg).forEach((chunk) => {
        bus.emit(`${this.key}:send:chunk`, {id: id, chunk: chunk})
      })
      bus.emit(`${this.key}:send:chunk:done`, id)
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
