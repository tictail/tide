import React from 'react'

export default React.createClass({
  render() {
    return (
      <div className="app todoapp">
        {this.props.children}
      </div>
    )
  }
})
