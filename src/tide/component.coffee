React = require "react/addons"
ShallowEqual = require "react/lib/shallowEqual"
assign = require "lodash.assign"
isArray = require "lodash.isarray"
mapValues = require "lodash.mapvalues"
omit = require "lodash.omit"

NOT_KEY_PATH_PROPS = [
  "children"
  "tide"
  "impure"
]

excludedProps = {}
NOT_KEY_PATH_PROPS.map (prop) -> excludedProps[prop] = true

class TideComponent extends React.Component
  @displayName: "TideComponent"

  @contextTypes:
    tide: React.PropTypes.object

  @childContextTypes:
    tide: React.PropTypes.object

  getChildContext: ->
    tide: @getTide()

  getTide: ->
    @props.tide or @context.tide

  componentWillMount: ->
    @_keyPaths = @getKeyPaths @props
    @_props = @getPropsFromKeyPaths @_keyPaths

    @getTide().onChange @onStateChange

  componentWillUpdate: (props) ->
    @_keyPaths = @getKeyPaths props
    @_props = @getPropsFromKeyPaths @_keyPaths

  componentWillUnmount: ->
    @_isUnmounting = true
    @getTide().offChange @onStateChange

  shouldComponentUpdate: ->
    shouldUpdate = !!@props.impure
    @getTide().logComponentRender("parent", React.findDOMNode(this)) if shouldUpdate
    shouldUpdate

  onStateChange: =>
    return if @_isUnmounting
    if @hasStaleProps()
      @forceUpdate()
      @getTide().logComponentRender "state", React.findDOMNode(this)

  getKeyPaths: (props) ->
    keyPaths = omit(props, (value, key) -> excludedProps[key])
    keyPaths = mapValues keyPaths, (value, key) ->
      return value if isArray value
      return [key] if value is true
      value.split "."
    keyPaths

  getPropsFromKeyPaths: (keyPaths) ->
    state = @getTide().getState()
    mapValues keyPaths, (value) ->
      [..., last] = value
      if last is "toJS()"
        obj = state.getIn value.slice 0, -1
        return obj?.toJS()
      return state.getIn value

  hasStaleProps: =>
    not ShallowEqual @_props, @getPropsFromKeyPaths(@_keyPaths)

  getChildProps: ->
    keyPaths = assign {}, @_keyPaths

    assign {}, @_props,
      tide:
        keyPaths: keyPaths
        actions: @getTide().getActions()

  wrapChild: (child) =>
    React.addons.cloneWithProps child, @getChildProps()

  render: ->
    if React.Children.count(@props.children) is 1
      @wrapChild @props.children
    else
      React.createElement "span", null, React.Children.map(@props.children, @wrapChild)

module.exports = TideComponent
