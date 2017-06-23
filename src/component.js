import React from 'react'
import PropTypes from 'prop-types'
import shallowEqual from 'shallowequal'
import mapValues from 'lodash.mapvalues'
import Tide from './base'

const NOT_KEY_PATH_PROPS = [
  'children',
  'tide',
  'key',
  'ref',
]

function omit(object, func) {
  return Object.keys(object).reduce((obj, key) => {
    const value = object[key]
    return func(key, value) ? obj : {...obj, [key]: value}
  }, {})
}

const excludedProps = NOT_KEY_PATH_PROPS.reduce((val, prop) => {
  val[prop] = true
  return val
}, {})

export default class TideComponent extends React.Component {
  constructor(...args) {
    super(...args)
    this.tide = this.props.tide instanceof Tide ? this.props.tide : this.context.tide
    this.state = this.getMappedProps()
  }

  getChildContext() {
    return {tide: this.tide}
  }

  componentWillMount() {
    this.tide.onChange(this.handleTideStateChange)
  }

  componentWillUnmount() {
    this._isUnmounting = true
    this.tide.offChange(this.handleTideStateChange)
  }

  handleTideStateChange = () => {
    if (this._isUnmounting) return

    const newState = this.getMappedProps()
    if (shallowEqual(newState, this.state) === false) {
      this.setState(newState)
    }
  }

  getKeyPaths() {
    let keyPaths = omit(this.props, (key) => excludedProps[key])

    keyPaths = mapValues(keyPaths, (val, key) => {
      const value = typeof val === 'function' ? val(this.tide.getState()) : val
      if (Array.isArray(value)) return value
      if (value === true) return [key]
      return value.split('.')
    })
    return keyPaths
  }

  getMappedProps() {
    const state = this.tide.getState()
    return mapValues(this.getKeyPaths(), (value) => state.getIn(value))
  }

  getChildProps() {
    const tide = {
      keyPaths: this.getKeyPaths(),
      ...this.tide.getComponentProps(),
    }
    const mappedProps = omit(this.state, (_, value) => value === undefined)

    return {...mappedProps, tide}
  }

  render() {
    return this.props.children(this.getChildProps())
  }
}

if (process.env.NODE_ENV !== 'production') {
  TideComponent.displayName = 'TideComponent'
  TideComponent.propTypes = {
    tide: PropTypes.object,
  }
}

const contextTypes = {tide: PropTypes.object}
TideComponent.contextTypes = contextTypes
TideComponent.childContextTypes = contextTypes
