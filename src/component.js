import React from 'react'
import {findDOMNode} from 'react-dom'
import cloneWithProps from 'react-addons-clone-with-props'
import shallowEqual from 'react-pure-render/shallowEqual'
import assign from 'lodash.assign'
import isArray from 'lodash.isarray'
import forEach from 'lodash.foreach'
import mapValues from 'lodash.mapvalues'
import omit from 'lodash.omit'

const displayName = 'TideComponent'
const contextTypes = {tide: React.PropTypes.object}
const childContextTypes = {tide: React.PropTypes.object}

const NOT_KEY_PATH_PROPS = [
  'children',
  'tide',
  'impure'
]

let excludedProps = {}
forEach(NOT_KEY_PATH_PROPS, (prop) => { excludedProps[prop] = true })

class Component extends React.Component {
  getChildContext() {
    return {tide: this.getTide()}
  }

  getTide() {
    return this.props.tide || this.context.tide
  }

  componentWillMount() {
    this._keyPaths = this.getKeyPaths(this.props)
    this._props = this.getPropsFromKeyPaths(this._keyPaths)

    this.getTide().onChange(this.onStateChange.bind(this))
  }

  componentWillUpdate(props) {
    this._keyPaths = this.getKeyPaths(props)
    this._props = this.getPropsFromKeyPaths(this._keyPaths)
  }

  componentWillUnmount() {
    this._isUnmounting = true
    this.getTide().offChange(this.onStateChange)
  }

  shouldComponentUpdate() {
    const shouldUpdate = !!this.props.impure
    if (shouldUpdate) this.getTide().logComponentRender('parent', findDOMNode(this))
    return shouldUpdate
  }

  onStateChange() {
    if (this._isUnmounting) return
    if (!this.hasStaleProps()) return

    this.forceUpdate()
    this.getTide().logComponentRender('state', findDOMNode(this))
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

  getPropsFromKeyPaths(keyPaths) {
    let state = this.getTide().getState()
    let props = mapValues(keyPaths, (value) => {
      let last = value[value.length - 1]
      if (last === 'toJS()') {
        let obj = state.getIn(value.slice(0, -1))
        if (obj) return obj.toJS()
      }
      return state.getIn(value)
    })
    return omit(props, (value) => { return value === undefined })
  }

  hasStaleProps() {
    return !shallowEqual(this._props, this.getPropsFromKeyPaths(this._keyPaths))
  }

  getChildProps() {
    let keyPaths = assign({}, this._keyPaths)

    return assign({}, this._props, {
      tide: {
        keyPaths: keyPaths,
        actions: this.getTide().getActions()
      }
    })
  }

  wrapChild(child) {
    return React.cloneElement(child, this.getChildProps())
  }

  render() {
    if (React.Children.count(this.props.children) === 1) {
      return this.wrapChild(this.props.children)
    } else {
      return React.createElement(
        'span',
        null,
        React.Children.map(this.props.children, this.wrapChild.bind(this))
      )
    }
  }
}

Component.displayName = displayName
Component.contextTypes = contextTypes
Component.childContextTypes = childContextTypes

export default Component