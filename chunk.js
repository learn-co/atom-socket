const CHUNK_SIZE = 1000000

function chunk(str) {
  var numChunks = Math.ceil(str.length / CHUNK_SIZE),
      chunks = new Array(numChunks);

  for(var i = 0, o = 0; i < numChunks; ++i, o += CHUNK_SIZE) {
    chunks[i] = str.substr(o, CHUNK_SIZE);
  }

  return chunks;
}

chunk.SIZE = CHUNK_SIZE

module.exports = chunk
