const React = require('react')
const ReactDOM = require('react-dom')
const _ = require('lodash')

const log = []

class Log extends React.Component {
  constructor(props) {
    super(props)
    this.state = {log: log}
  }

  componentDidMount() {
    window.log = (data) => {
      if (typeof data === 'string') {
        log.unshift({key: 'info', data: data})
      } else {
        log.unshift(data)
      }
      this.setState({log: log})
    }
  }

  render() {
    var connections = _.compact(_.uniq(_.map(this.state.log, (item) => { return item.key }))).sort().map((name, i) => {
      return <li key={ i }>{ name }</li>
    })

    var events = _.compact(_.uniq(_.map(this.state.log, (item) => { return item.event }))).sort().map((event, i) => {
      return <li key={ i }>{ event }</li>
    })

    var log = this.state.log.slice(0, 99).map((item, i) => {
      return <li key={ i }>{ `${item.key}:${item.event || ''}: ${item.data || ''}` }</li>
    })

    return (
      <div>
        <h5>Connections</h5>
        <ul>{ connections }</ul>

        <h5>Events</h5>
        <ul>{ events }</ul>

        <h5>Log</h5>
        <ul>{ log }</ul>
      </div>
    )
  }
}

ReactDOM.render(<Log />, document.getElementById('root'))
