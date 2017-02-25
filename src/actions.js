export class Actions {
  constructor(tide) {
    this.tide = tide
  }

  getState() {
    return this.tide.getState()
  }

  setState(state, options) {
    this.tide.setState(state, options)
  }

  updateState(updater, options) {
    this.tide.updateState(updater, options)
  }

  mutate(keyPath, value, options) {
    this.tide.mutate(keyPath, value, options)
  }

  get(keyPath) {
    return this.tide.get(keyPath)
  }

  getActions(name) {
    return this.tide.getActions(name)
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
