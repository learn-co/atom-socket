const React = require('react')
const ReactDOM = require('react-dom')

module.exports = {
  start(el) {
    ReactDOM.render(React.createElement('h1', null, 'Hello world'), el)
  }
}
