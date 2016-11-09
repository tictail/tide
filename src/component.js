import React from 'react'
import shallowEqual from 'react-pure-render/shallowEqual'
import assign from 'lodash.assign'
import isArray from 'lodash.isarray'
import mapValues from 'lodash.mapvalues'
import omit from 'lodash.omit'

const displayName = 'TideComponent'
const contextTypes = {tide: React.PropTypes.object}
const childContextTypes = {tide: React.PropTypes.object}
const propTypes = {
  impure: React.PropTypes.bool,
  tide: React.PropTypes.object,
}

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
    super(props)
    const tide = props.tide || context.tide
    this._keyPaths = this.getKeyPaths(props)
    this._componentTide = {
      keyPaths: this._keyPaths,
      actions: tide.getActions(),
    }

    this.state = this.getPropsFromKeyPaths(this._keyPaths, tide)
  }

  getChildContext() {
    return {tide: this.getTide()}
  }

  componentWillMount() {
    this._onStateChange = this.onStateChange.bind(this)
    this.getTide().onChange(this._onStateChange)
  }

  componentWillReceiveProps(newProps) {
    this._keyPaths = this.getKeyPaths(newProps)
  }

  componentWillUnmount() {
    this._isUnmounting = true
    this.getTide().offChange(this._onStateChange)
  }

  onStateChange() {
    if (this._isUnmounting) return
    const newState = this.getPropsFromKeyPaths(this._keyPaths, this.getTide())
    if (this.hasStaleState(newState)) {
      this.setState(newState)
    }
  }

  getKeyPaths(props) {
    let keyPaths = omit(props, (value, key) => { return excludedProps[key] })
    keyPaths = mapValues(keyPaths, (value, key) => {
      if (isArray(value)) return value
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
    return this.props.tide || this.context.tide
  }

  getChildProps() {
    return assign(omit(this.state, (value) => value === undefined), {tide: this._componentTide})
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

Component.displayName = displayName
Component.propTypes = propTypes
Component.contextTypes = contextTypes
Component.childContextTypes = childContextTypes

module.exports = Component
