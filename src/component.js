import React from 'react'
import shallowEqual from 'react-pure-render/shallowEqual'
import mapValues from 'lodash.mapvalues'
import omit from 'lodash.omit'

import TideBase from './base'

const NOT_KEY_PATH_PROPS = [
  'children',
  'tide',
  'impure',
  'key',
  'ref',
]

const excludedProps = NOT_KEY_PATH_PROPS.reduce((val, prop) => {
  val[prop] = true
  return val
}, {})

class Component extends React.Component {
  constructor(props, context) {
    super(props, context)
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
    let keyPaths = omit(props, (value, key) => { return excludedProps[key] })
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
    return mapValues(keyPaths, (value) => {
      const last = value[value.length - 1]
      if (last === 'toJS()') {
        const obj = state.getIn(value.slice(0, -1))
        if (obj) return obj.toJS()
      }
      return state.getIn(value)
    })
  }

  getTide() {
    return this.props.tide instanceof TideBase ? this.props.tide : this.context.tide
  }

  getChildProps() {
    return {...omit(this.state, (value) => value === undefined), tide: this._componentTide}
  }

  hasStaleState(newState) {
    return !shallowEqual(this.state, newState)
  }

  wrapChild(child) {
    return React.cloneElement(child, this.getChildProps())
  }

  render() {
    return React.Children.count(this.props.children) === 1 ?
      this.wrapChild(this.props.children) :
      React.createElement(
        'span',
        null,
        React.Children.map(this.props.children, this.wrapChild.bind(this))
      )
  }
}

if (process.evn.NODE_ENV !== 'production') {
  const displayName = 'TideComponent'
  const propTypes = {
    impure: React.PropTypes.bool,
    tide: React.PropTypes.object,
  }
  Component.displayName = displayName
  Component.propTypes = propTypes
}

const contextTypes = {tide: React.PropTypes.object}
const childContextTypes = {tide: React.PropTypes.object}
Component.contextTypes = contextTypes
Component.childContextTypes = childContextTypes

export default Component
