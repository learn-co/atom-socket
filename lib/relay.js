const bus = require('page-bus')()
const chunker = require('./chunker')
const WebSocketCache = require('./cache')

const cache = new WebSocketCache()

console.log(`current process is ${process.pid}`)

setInterval(() => {
  bus.emit('atom-socket:relay:ready', Date.now())
}, 500)

window.onbeforeunload = () => {
  localStorage.removeItem('atom-socket:relay:running')
  window.removeEventListener('offline', cache.resetAll.bind(cache))
}

window.addEventListener('offline', cache.resetAll.bind(cache))

bus.on('create', ({key, url}) => {
  console.log(`received request for ${key}: ${url}`)

  if (cache.hasWebSocket(key)) {
    console.log(`found websocket in cache for ${key}: ${url}`)
    bus.emit(`${key}:open:cached`)
  } else {
    cache.createWebSocket(key, url, {
      onopen() {
        console.log(`websocket open for ${this.key}: ${this.url}`)
        bus.emit(`${this.key}:open`)
      },

      onmessage(msg) {
        if (msg.data.length > chunker.CHUNK_SIZE) {
          chunker.sendChunked(`${this.key}:message`, msg.data)
        } else {
          console.log(`received message for ${this.key}: ${this.url}`, msg.data)
          bus.emit(`${this.key}:message`, msg.data)
        }
      },

      onerror(err) {
        console.log(`error for ${this.key}: ${this.url}`, err)
        bus.emit(`${this.key}:error`, err)
      },

      onclose() {
        console.log(`websocket close for ${this.key}: ${this.url}`)
        bus.emit(`${this.key}:close`)
      }
    })

    bus.on(`${key}:send`, (msg) => {
      console.log(`sending message for ${key}: ${url}`, msg)
      cache.getWebSocket(key).send(msg)
    })

    chunker.onChunked(`${key}:send`, (msg) => {
      cache.getWebSocket(key).send(msg)
    })

    bus.on(`${key}:close:request`, () => {
      console.log(`closing websocket for ${key}: ${url}`)
      cache.getWebSocket(key).close()
    })

    bus.on(`${key}:reset:request`, () => {
      console.log(`resetting websocket for ${key}: ${url}`)
      cache.resetWebSocket(key)
    })
  }
})

