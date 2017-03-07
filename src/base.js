function defer(fn) {
  setTimeout(fn, 1)
}

function getNextState(oldState, newState) { return newState }

function getMiddewareFn(middleware) {
  return middleware ?
    middleware.reduce((fn, middle) => middle(fn), getNextState) :
    getNextState
}

export default class Tide {
  constructor({middleware = []} = {}) {
    this.middleware = middleware
    this.middlewareFn = getMiddewareFn(this.middleware)
  }

  state = null
  changeHandlers = []
  _componentProps = {}

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

  addMiddleware(newMiddleware) {
    this.middleware = [...this.middleware, newMiddleware]
    this.middlewareFn = getMiddewareFn(this.middleware)
  }

  addProp(name, prop) {
    if (process.env.NODE_ENV !== 'production' && this[name]) {
      throw new Error(`Naming conflict, ${name} is already defined`)
    }
    this[name] = prop
  }

  addComponentProp(name, obj) {
    if (process.env.NODE_ENV !== 'production' && this._componentProps[name]) {
      throw new Error(`Naming conflict, ${name} is already defined`)
    }
    this._componentProps[name] = obj
  }

  getComponentProps() {
    return this._componentProps
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
