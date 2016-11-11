const bus = require('page-bus')()
const websockets = {}

window.onbeforeunload = () => {
  localStorage.removeItem('socket:drawer:running')
}

bus.on('create', ({key, url}) => {
  if (websockets[key]) {
    var ws = websockets[key]
  } else {
    var ws = new WebSocket(url)
    websockets[key] = ws

    ws.onopen = () => {
      bus.emit(`${key}:open`)
    }

    ws.onmessage = (msg) => {
      bus.emit(`${key}:message`, msg.data)
    }

    bus.on(`${key}:send`, (msg) => {
      ws.send(msg)
    })
  }
})
