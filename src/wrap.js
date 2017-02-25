import React from 'react'
import shallowEqual from 'react-pure-render/shallowEqual'

import {Component as TideComponent} from './component'

export function wrap(ComponentClass, {impure, ...tideProps} = {}) {
  return class Wrapped extends React.Component {
    shouldComponentUpdate(nextProps) {
      if (impure) return true
      return !shallowEqual(this.props, nextProps)
    }

    render() {
      return (
        <TideComponent {...tideProps}>
          {(props) => <ComponentClass {...props} {...this.props} />}
        </TideComponent>
      )
    }
  }
}
