const React = require('react')
const ReactDOM = require('react-dom')
const _ = require('lodash')

const log = []

class Log extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      log: log,
      events: [],
      connections: []
    }
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

  filterConnection(connectionKey) {
    var index = this.state.connections.indexOf(connectionKey)

    if (index > -1) {
      var cxns = this.state.connections.concat([])
      cxns.splice(index, 1)      
      this.setState({connections: cxns})
    } else {
      this.setState({connections: _.uniq(this.state.connections.concat([connectionKey]))})
    }
  }

  render() {
    var connections = _.compact(_.uniq(_.map(this.state.log, (item) => {
      return item.key 
    }))).sort().map((name, i) => {
      var activeFilter = this.state.connections.indexOf(name) > -1

      var style = {
        backgroundColor:  activeFilter ? 'red' : ''
      }

      return <li style={ style } onClick={ () => { this.filterConnection(name) } } key={ i }>{ name }</li>
    })

    var events = _.compact(_.uniq(_.map(this.state.log, (item) => { 
      return item.event 
    }))).sort().map((event, i) => {
      return <li key={ i }>{ event }</li>
    })

    var log = this.state.log.slice(0, 99).map((item, i) => {
      if ((this.state.connections.length > 0) && this.state.connections.indexOf(item.key) === -1) {
        return false
      }

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
