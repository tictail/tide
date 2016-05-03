class Actions {
  constructor(tide) {
    this.tide = tide
    if (this.initialize) this.initialize()
  }

  getState() {
    return this.tide.getState()
  }

  setState(state) {
    this.tide.setState(state)
  }

  updateState(updater) {
    this.tide.updateState(updater)
  }

  mutate(keyPath, value) {
    this.tide.mutate(keyPath, value)
  }

  get(keyPath) {
    return this.tide.get(keyPath)
  }

  getActions(name) {
    return this.tide.getActions(name)
  }
}

module.exports = Actions
