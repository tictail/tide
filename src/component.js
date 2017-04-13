import React from 'react'
import PropTypes from 'prop-types'
import shallowEqual from 'react-pure-render/shallowEqual'
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
  constructor(props) {
    super(...arguments)
    const tide = this.getTide()
    const keyPaths = this.getKeyPaths(props, tide)
    this._componentTide = {
      keyPaths,
      ...tide.getComponentProps(),
    }

    this.state = this.getPropsFromKeyPaths(keyPaths, tide)
  }

  getChildContext() {
    return {tide: this.getTide()}
  }

  componentWillMount() {
    this._onStateChange = this.onStateChange.bind(this)
    this.getTide().onChange(this._onStateChange)
  }

  componentWillUnmount() {
    this._isUnmounting = true
    this.getTide().offChange(this._onStateChange)
  }

  onStateChange() {
    if (this._isUnmounting) return
    const tide = this.getTide()
    const newState = this.getPropsFromKeyPaths(this.getKeyPaths(this.props, tide), tide)
    if (this.hasStaleState(newState)) {
      this.setState(newState)
    }
  }

  getKeyPaths(props, tide) {
    let keyPaths = omit(props, (key) => excludedProps[key])
    keyPaths = mapValues(keyPaths, (val, key) => {
      const value = typeof val === 'function' ? val(tide.getState()) : val
      if (Array.isArray(value)) return value
      if (value === true) return [key]
      return value.split('.')
    })
    return keyPaths
  }

  getPropsFromKeyPaths(keyPaths, tide) {
    const state = tide.getState()
    return mapValues(keyPaths, (value) => state.getIn(value))
  }

  getTide() {
    return this.props.tide instanceof Tide ?
      this.props.tide : this.context.tide
  }

  getChildProps() {
    return {...omit(this.state, (_, value) => value === undefined), tide: this._componentTide}
  }

  hasStaleState(newState) {
    return !shallowEqual(this.state, newState)
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
