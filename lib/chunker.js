const CHUNK_SIZE = 1000000
const chunkBuffer = {}
const bus = require('page-bus')()

function chunk(str) {
  var numChunks = Math.ceil(str.length / CHUNK_SIZE),
      chunks = new Array(numChunks);

  for(var i = 0, o = 0; i < numChunks; ++i, o += CHUNK_SIZE) {
    chunks[i] = str.substr(o, CHUNK_SIZE);
  }

  return chunks;
}

module.exports = {
  sendChunked(key, msg) {
    var id = Date.now()
    chunk(msg).forEach((chunk) => {
      bus.emit(`${key}:chunk`, {id: id, chunk: chunk})
    })
    bus.emit(`${key}:chunk:done`, id)
  },

  onChunked(key, cb) {
    bus.on(`${key}:chunk`, ({id, chunk}) => {
      chunkBuffer[id] || (chunkBuffer[id] = '')
      chunkBuffer[id] = chunkBuffer[id] + chunk
    })

    bus.on(`${key}:chunk:done`, (id) => {
      cb(chunkBuffer[id])
      delete chunkBuffer[id]
    })
  },

  CHUNK_SIZE: CHUNK_SIZE
}
