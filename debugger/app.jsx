const React = require('react')
const ReactDOM = require('react-dom')

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
    var log = this.state.log.slice(0, 99).map((item, i) => {
      return <li key={ i }>{ `${item.key}:${item.event || ''}: ${item.data || ''}` }</li>
    })

    return <ul>{ log }</ul>
  }
}

ReactDOM.render(<Log />, document.getElementById('root'))
