import React from 'react'
import shallowEqual from 'react-pure-render/shallowEqual'

import TideComponent from './component'

export default function wrap(ComponentClass, {impure, ...tideProps} = {}, mappers) {
  function mapProps(props) {
    return Object.keys(mappers).reduce((obj, key) => {
      const mapper = mappers[key]
      if (process.env.NODE_ENV !== 'production') {
        if (typeof mapper !== 'function') {
          throw new Error('Mapper must be a function')
        }
      }
      return mapper ? {...obj, [key]: mapper(props[key])} : obj
    }, props)
  }
  return class Wrapped extends React.Component {
    shouldComponentUpdate(nextProps) {
      if (impure) return true
      return !shallowEqual(this.props, nextProps)
    }

    render() {
      return (
        <TideComponent {...tideProps}>
          {(props) => <ComponentClass {...(mappers ? mapProps(props) : props)} {...this.props} />}
        </TideComponent>
      )
    }
  }
}
