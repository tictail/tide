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
    this.tide.get(keyPath)
  }

  getActions(name) {
    this.tide.getActions(name)
  }
}

export default Actions
