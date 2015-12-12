import React from 'react'
import shallowEqual from 'react-pure-render/shallowEqual'
import assign from 'lodash.assign'

import TideComponent from './component'

export default function(componentClass, tideProps = {}) {
  let isImpure = tideProps.impure
  tideProps = assign({}, tideProps, {impure: true})

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
