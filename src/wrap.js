import React from 'react'
import shallowEqual from 'react-pure-render/shallowEqual'

import TideComponent from './component'

export default function(componentClass, initialTideProps = {}) {
  const isImpure = initialTideProps.impure
  const tideProps = {...initialTideProps, impure: true}

  return React.createClass({
    shouldComponentUpdate(nextProps) {
      if (isImpure) return true
      return !shallowEqual(this.props, nextProps)
    },

    render() {
      return React.createElement(TideComponent, tideProps,
        React.createElement(componentClass, this.props)
      )
    }
  })
}
