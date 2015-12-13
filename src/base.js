import React from 'react'
import assign from 'lodash.assign'
import diff from 'immutablediff'
import forEach from 'lodash.foreach'
import isArray from 'lodash.isarray'
import keys from 'lodash.keys'
import wrap from 'lodash.wrap'
import {EventEmitter} from 'events'

import TideComponent from './component'
import Utils from './utils'

class Base extends EventEmitter {
  constructor() {
    super()
    this.state = null
    this.actions = {}
    this.logging = {}
    this.setMaxListeners(0)
    if (this.initialize) this.initialize()
  }

  getState() {
    return this.state
  }

  setState(state) {
    this.logStateUpdate(this.state, state)
    this.state = state
    this.emitChange()
  }

  updateState(updater) {
    this.setState(updater(this.state))
  }

  mutate(keyPath, value) {
    if (!isArray(keyPath)) keyPath = keyPath.split('.')
    if (typeof value === 'function') value = value(this.getState().getIn(keyPath))
    this.setState(this.getState().setIn(keyPath, value))
  }

  get(keyPath) {
    if (!isArray(keyPath)) keyPath = keyPath.split('.')
    return this.getState().getIn(keyPath)
  }

  addActions(name, actionsClass) {
    this.actions[name] = new actionsClass(this)
  }

  getActions(name) {
    if (name) return this.actions[name]
    return assign({}, this.actions)
  }

  enableLogging({actions, state, components}) {
    if (actions) {
      this.logging.actions = true
      this.wrapActionMethods()
    }

    if (state) this.logging.state = true
    if (components) this.logging.components = true
  }

  wrapActionMethods() {
    let logActionCall = this.logActionCall.bind(this)
    forEach(this.actions, function(actions, actionsName) {
      let methods = keys(Utils.getInternalMethods(actions.constructor))

      forEach(methods, function(method) {
        actions[method] = wrap(actions[method], function(func) {
          let callArgs = Array.prototype.slice.call(arguments, 1)
          logActionCall(actionsName, method, callArgs)
          func.apply(this, callArgs)
        })
      })
    })
  }

  logActionCall(actionsName, methodName, args) {
    if (!this.logging.actions) return

    let logArgs = [
      '%cAction performed', 'font-weight: bold;', `${actionsName}.${methodName}`
    ].concat(args)
    console.log.apply(console, logArgs)
  }

  logStateUpdate(currentState, nextState) {
    if (!this.logging.state) return

    if (console.group) console.group('%cState mutation', 'font-weight: bold;')

    console.log('%cCurrent state', 'color: gray; font-weight: bold; %O', currentState.toJS())
    let operations = diff(currentState, nextState)
    if (operations.size > 1) {
      console.log('%cOperations %O', 'font-weight: bold;', diff(currentState, nextState).toJS())
    } else if (operations.size === 1) {
      let operation = operations.first().toJS()
      console.log('%cOperation', 'font-weight: bold;', operation.op, operation.path, operation.value)
    } else {
      console.log('%cOperation', 'font-weight: bold;', 'Noop')
    }
    console.log('%cNext state', 'color: green; font-weight: bold; %O',
                nextState ? nextState.toJS() : '')

    if (console.groupEnd) console.groupEnd()
  }

  logComponentRender(source, component) {
    if (!this.logging.components) return
    console.log('%cComponent', 'font-weight: bold;', `Re-render from ${source}`, component)
  }

  onChange(handler) {
    this.addListener('change', handler)
  }

  offChange(handler) {
    this.removeListener('change', handler)
  }

  emitChange() {
    this.emit('change')
  }
}

export default Base
