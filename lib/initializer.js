const bus = require('page-bus')()
const path = require('path')
const tabex = require('tabex').client()
const {BrowserWindow} = require('electron').remote

const KEY = 'atom-socket:relay:running'

module.exports = initializer = {
  openRelayWindow() {
    tabex.lock(KEY, (unlock) => {
      if (this.isRunning()) { return unlock() }

      this._createWindow().then(unlock)
    })
  },

  isRunning() {
    return BrowserWindow.getAllWindows().some((win) => {
      return win.getTitle() === localStorage.getItem(KEY)
    })
  },

  onReady(callback) {
    return this._readyPromise.then(callback)
  },

  toggleRelayWindowVisibility() {
    if (!this.isRunning()) { return }

    var win = this._getWindow()
    win.isVisible() ? win.hide() : win.show()
  },

  _getWindow() {
    return BrowserWindow.getAllWindows().find((win) => {
      return win.getTitle() === localStorage.getItem(KEY)
    })
  },

  _createWindow() {
    return new Promise((resolve, reject) => {
      var id = Date.now().toString()
      localStorage.setItem(KEY, id)

      var win = new BrowserWindow({show: false, title: id})
      win.loadURL(`file://${path.join(__dirname, 'relay.html')}`)
      win.webContents.openDevTools()
      win.on('ready-to-show', resolve)
    })
  },

  _readyPromise: new Promise((resolve, reject) => {
    bus.on('atom-socket:relay:ready', resolve)
  })
}

