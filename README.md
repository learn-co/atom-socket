# AtomSocket

Share websockets in Atom Packages.


## How It Works

AtomSocket uses Atom's `localStorage` API (via [page-bus](https://github.com/substack/page-bus)) to share websocket connections inside Atom packges across render processes.

## Install

`npm install atom-socket --save`


## Usage

```javascript
const AtomSocket = require('atom-socket')

const socket = new AtomSocket('term', 'wss://ide.learn.co:443/terminal')

socket.on('error', (err) => {
  console.error(err)
})

socket.on('open', () => {
  console.log('Client Connected')
})

socket.on('close', () => {
  console.log('Client Closed')
})

socket.on('message', (msg) => {
  console.log(msg)
})

socket.send('hello world')

socket.close()

socket.reset()
```

## License

[MIT Licensed](LICENSE.md)
