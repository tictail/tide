export default class Actions {
  constructor(tide) {
    this.tide = tide
    this.namespace = this.namespace || []
  }

  getState() {
    return this.get([])
  }

  setState(state, options) {
    this.setGlobalState(this.getGlobalState().setIn(this.namespace, state), options)
  }

  updateState(updater, options) {
    this.setState(updater(this.getState()), options)
  }

  mutate(keyPath, value, options) {
    this.tide.mutate(this._createKeyPath(keyPath), value, options)
  }

  get(keyPath) {
    return this.tide.get(this._createKeyPath(keyPath))
  }

  getActions(name) {
    return this.tide.getActions(name)
  }

  getGlobalState() {
    return this.tide.getState()
  }

  setGlobalState(state, options) {
    this.tide.setState(state, options)
  }

  updateGlobalState(updater, options) {
    this.setGlobalState(updater(this.getGlobalState()), options)
  }

  mutateGlobal(keyPath, value, options) {
    this.tide.mutate(keyPath, value, options)
  }

  getGlobal(keyPath) {
    return this.tide.get(keyPath)
  }

  _createKeyPath(keyPath) {
    const kp = Array.isArray(keyPath) ? keyPath : keyPath.split('.')
    return this.namespace.concat(kp)
  }
}

export function initActions(tide, actions) {
  const initializedActions = Object.keys(actions).reduce((obj, key) => {
    return {...obj, [key]: new actions[key](tide)}
  }, {})
  tide.addProp('actions', initializedActions)
  tide.addProp('getActions', function getActions(name) {
    return name ? initializedActions[name] : initializedActions
  })
  tide.addComponentProp('actions', tide.actions)
}
