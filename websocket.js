const bus = require('page-bus')()
const websockets = {}

window.onbeforeunload = () => {
  localStorage.removeItem('socket:drawer:running')
}

bus.on('create', ({key, url}) => {
  console.log(`received request for ${key}: ${url}`)
  if (websockets[key]) {
    console.log(`found websocket from cache for ${key}: ${url}`)
  } else {
    console.log(`creating new websocket for ${key}: ${url}`)

    var ws = new WebSocket(url)
    websockets[key] = ws

    ws.onopen = () => {
      console.log(`websocket open for ${key}: ${url}`)
      bus.emit(`${key}:open`)
    }

    ws.onmessage = (msg) => {
      console.log(`received message for ${key}: ${url}`, msg.data)
      bus.emit(`${key}:message`, msg.data)
    }

    bus.on(`${key}:send`, (msg) => {
      console.log(`sending message for ${key}: ${url}`, msg)
      ws.send(msg)
    })
  }
})
