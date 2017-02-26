import Actions from './actions'

export default class NamespacedActions extends Actions {
  constructor() {
    super(...arguments)
    this.namespace = this.namespace || []
  }

  getState() {
    return this.get([])
  }

  setState(state) {
    super.setState(super.getState().setIn(this.namespace, state))
  }

  updateState(updater) {
    this.setState(updater(this.getState()))
  }

  mutate(keyPath, value) {
    super.mutate(this._createKeyPath(keyPath), value)
  }

  get(keyPath) {
    return super.get(this._createKeyPath(keyPath))
  }

  getGlobalState() {
    return super.getState()
  }

  setGlobalState(state) {
    super.setState(state)
  }

  updateGlobalState(updater) {
    super.updateState(updater)
  }

  mutateGlobal(keyPath, value) {
    super.mutate(keyPath, value)
  }

  getGlobal(keyPath) {
    return super.get(keyPath)
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
