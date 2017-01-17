module.exports = class WS extends WebSocket {
  constructor(url, options) {
    super(url)

    this.options = options
    Object.assign(this, options)
  }

  clean() {
    Object.keys(this.options).forEach((key) => delete this[key])
  }
}

