const React = require('react')
const ReactDOM = require('react-dom')
const _ = require('lodash')
import JSONTree from 'react-json-tree'

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

  filterEvent(event) {
    console.log(event)
    var index = this.state.events.indexOf(event)

    if (index > -1) {
      var events = this.state.events.concat([])
      events.splice(index, 1)      
      this.setState({events: events})
    } else {
      console.log('wu')
      this.setState({events: _.uniq(this.state.events.concat([event]))})
    }
  }

  render() {
    console.log(this.state.events)
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
      var activeFilter = this.state.events.indexOf(event) > -1

      var style = {
        backgroundColor:  activeFilter ? 'red' : ''
      }

      return <li key={ i } style={ style } onClick={ () => { this.filterEvent(event) } }>{ event }</li>
    })

    var log = this.state.log.map((item, i) => {
      if ((this.state.connections.length > 0) && this.state.connections.indexOf(item.key) === -1) {
        return false
      }

      if ((this.state.events.length > 0) && this.state.events.indexOf(item.event) === -1) {
        return false
      }

      var json

      try {
        var data = JSON.parse(item.data)
        json = <JSONTree data={ data } hideRoot={ true }/>
      } catch (err) {
        json = <div><strong>{ item.data }</strong></div>
      }

      return (
        <li key={ i }>
          <span>{ `${item.key}:${item.event || ''}` }</span> 
          { json }
        </li>
      )
    }).slice(0, 99)

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
