class Actions {
  constructor(tide, actions) {
    this.tide = tide
    tide.actions = actions
    tide.getActions = function getActions(name) {
      return name ? actions[name] : actions
    }
    tide.setComponentProp('actions', actions)
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

module.exports = Actions
