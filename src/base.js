import assign from 'lodash.assign'
import diff from 'immutablediff'
import forEach from 'lodash.foreach'
import isArray from 'lodash.isarray'
import keys from 'lodash.keys'
import wrap from 'lodash.wrap'
import defer from 'lodash.defer'

import Utils from './utils'

/* eslint-disable no-console */
class Base {
  constructor() {
    this.state = null
    this.actions = {}
    this.logging = {}
    this.changeHandlers = []
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
    const kp = isArray(keyPath) ? keyPath : keyPath.split('.')
    const val = typeof value === 'function' ? value(this.getState().getIn(keyPath)) : value
    this.setState(this.getState().setIn(kp, val))
  }

  get(keyPath) {
    const kp = isArray(keyPath) ? keyPath : keyPath.split('.')
    return this.getState().getIn(kp)
  }

  addActions(name, ActionsClass) {
    this.actions[name] = new ActionsClass(this)
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
    const logActionCall = this.logActionCall.bind(this)
    forEach(this.actions, function(actions, actionsName) {
      const methods = keys(Utils.getInternalMethods(actions.constructor))

      forEach(methods, function(method) {
        actions[method] = wrap(actions[method], function(func) {
          const callArgs = Array.prototype.slice.call(arguments, 1)
          logActionCall(actionsName, method, callArgs)
          func.apply(this, callArgs)
        })
      })
    })
  }

  logActionCall(actionsName, methodName, args) {
    if (!this.logging.actions) return

    const logArgs = [
      '%cAction performed', 'font-weight: bold;', `${actionsName}.${methodName}`
    ].concat(args)
    console.log.apply(console, logArgs)
  }

  logStateUpdate(currentState, nextState) {
    if (!this.logging.state) return

    if (console.group) console.group('%cState mutation', 'font-weight: bold;')

    console.log('%cCurrent state', 'color: gray; font-weight: bold; %O', currentState.toJS())
    const operations = diff(currentState, nextState)
    if (operations.size > 1) {
      console.log('%cOperations %O', 'font-weight: bold;', diff(currentState, nextState).toJS())
    } else if (operations.size === 1) {
      const operation = operations.first().toJS()
      console.log(
        '%cOperation',
        'font-weight: bold;',
        operation.op, operation.path, operation.value
      )
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
    this.changeHandlers.push(handler)
  }

  offChange(handler) {
    forEach(this.changeHandlers, (fn, i) => {
      if (handler === fn) {
        this.changeHandlers.splice(i, 1)
        return false
      }
    })
  }

  emit() {
    forEach(this.changeHandlers, (fn) => { fn && fn() })
  }

  emitChange() {
    if (this._willEmit) return
    this._willEmit = true
    defer(() => {
      this._willEmit = false
      this.emit()
    })
  }
}
/* eslint-enable no-console */

module.exports = Base
