class Actions
  constructor: (@tide) ->
    @initialize?()

  getState: ->
    @tide.getState()

  setState: (state) ->
    @tide.setState state

  updateState: (updater) ->
    @tide.updateState updater

  mutate: (keyPath, value) ->
    @tide.mutate keyPath, value

  get: (keyPath) ->
    @tide.get keyPath

  getActions: (name) ->
    @tide.getActions name

module.exports = Actions
