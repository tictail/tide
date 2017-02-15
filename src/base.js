import defer from 'lodash.defer'

function getNextState(oldState, newState) { return newState }

function getMiddewareFn(middleware) {
  return middleware ?
    middleware.reduce((fn, middle) => middle(fn), getNextState) :
    getNextState
}

class Base {
  constructor() {
    this.state = null
    this.actions = {}
    this.changeHandlers = []
    this.middleware = []
    this.middlewareFn = getMiddewareFn(this.middleware)
    if (this.initialize) this.initialize()
  }

  getState() {
    return this.state
  }

  setState(state, options) {
    this.state = this.middlewareFn(this.state, state)
    this.emitChange(options)
  }

  updateState(updater, options) {
    this.setState(updater(this.state), options)
  }

  mutate(keyPath, value, options) {
    const kp = Array.isArray(keyPath) ? keyPath : keyPath.split('.')
    const val = typeof value === 'function' ? value(this.getState().getIn(kp)) : value
    this.setState(this.getState().setIn(kp, val), options)
  }

  get(keyPath) {
    const kp = Array.isArray(keyPath) ? keyPath : keyPath.split('.')
    return this.getState().getIn(kp)
  }

  addActions(name, ActionsClass) {
    this.actions[name] = new ActionsClass(this)
  }

  addMiddleware(newMiddleware) {
    this.middleware = [...this.middleware, newMiddleware]
    this.middlewareFn = getMiddewareFn(this.middleware)
  }

  getActions(name) {
    return name ? this.actions[name] : {...this.actions}
  }

  onChange(handler) {
    this.changeHandlers.push(handler)
  }

  offChange(handler) {
    this.changeHandlers.forEach((fn, i) => {
      if (handler === fn) {
        this.changeHandlers.splice(i, 1)
        return false
      }
    })
  }

  emit() {
    this.changeHandlers.forEach((fn) => { fn && fn() })
  }

  emitChange(options = {}) {
    if (options.immediate) {
      this.emit()
    } else if (!this._willEmit) {
      this._willEmit = true
      defer(() => {
        this._willEmit = false
        this.emit()
      })
    }
  }
}

export default Base
