React = require "react"
assign = require "lodash.assign"
diff = require 'immutablediff'
forEach = require "lodash.foreach"
isArray = require "lodash.isarray"
keys = require "lodash.keys"
wrap = require "lodash.wrap"
{EventEmitter} = require "events"

TideComponent = require "./component"
Utils = require "./utils"

class Base extends EventEmitter
  state: null

  constructor: ->
    @actions = {}
    @logging = {}
    @setMaxListeners 0
    @initialize?()

  getState: ->
    @state

  setState: (state) ->
    @logStateUpdate(@state, state)
    @state = state
    @emitChange()

  updateState: (updater) ->
    @setState updater(@state)

  mutate: (keyPath, value) ->
    keyPath = keyPath.split('.') if not isArray(keyPath)
    value = value(@getState().getIn(keyPath)) if typeof value is 'function'
    @setState(@getState().setIn(keyPath, value))

  get: (keyPath) ->
    keyPath = keyPath.split('.') if not isArray(keyPath)
    @getState().getIn(keyPath)

  addActions: (name, actionsClass) ->
    @actions[name] = new actionsClass this

  getActions: (name) ->
    if name
      @actions[name]
    else
      assign {}, @actions

  enableLogging: ({actions, state, components}) ->
    if actions
      @logging.actions = true
      @wrapActionMethods()

    @logging.state = true if state
    @logging.components = true if components

  wrapActionMethods: ->
    logActionCall = @logActionCall.bind this

    forEach @actions, (actions, actionsName) ->
      methods = keys Utils.getInternalMethods(actions.constructor)
      forEach methods, (method) ->
        actions[method] = wrap actions[method], (func) ->
          callArgs = Array::slice.call(arguments, 1)
          logActionCall actionsName, method, callArgs
          func.apply this, callArgs

  logActionCall: (actionsName, methodName, args) ->
    return unless @logging.actions

    logArgs = ["%cAction performed", "font-weight: bold;", "#{actionsName}.#{methodName}"].concat(args)
    console.log.apply console, logArgs

  logStateUpdate: (currentState, nextState) ->
    return unless @logging.state

    console.group? "%cState mutation", "font-weight: bold;"
    console.log "%cCurrent state", "color: gray; font-weight: bold; %O", currentState.toJS()
    operations = diff(currentState, nextState)
    if operations.size > 1
      console.log("%cOperations %O", "font-weight: bold;", diff(currentState, nextState).toJS())
    else if operations.size == 1
      operation = operations.first().toJS()
      console.log("%cOperation", "font-weight: bold;", operation.op, operation.path, operation.value)
    else
      console.log("%cOperation", "font-weight: bold;", "Noop")
    console.log "%cNext state", "color: green; font-weight: bold; %O", nextState?.toJS()
    console.groupEnd?()

  logComponentRender: (source, component) ->
    return unless @logging.components

    console.log "%cComponent", "font-weight: bold;", "Re-render from #{source}", component

  onChange: (handler) ->
    @addListener "change", handler

  offChange: (handler) ->
    @removeListener "change", handler

  emitChange: ->
    @emit "change"

module.exports = Base
