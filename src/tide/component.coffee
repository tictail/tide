_ = require "underscore"
React = require "react/addons"
ShallowEqual = require "react/lib/shallowEqual"

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
    _(props)
      .chain()
      .omit (value, key) -> excludedProps[key]
      .mapObject (value, key) ->
        return value if _.isArray value
        return [key] if value is true
        value.split "."
      .value()

  getPropsFromKeyPaths: (keyPaths) ->
    state = @getTide().getState()
    _(keyPaths).mapObject (value) ->
      [..., last] = value
      if last is "toJS()"
        obj = state.getIn value.slice 0, -1
        return obj?.toJS()
      return state.getIn value

  hasStaleProps: =>
    not ShallowEqual @_props, @getPropsFromKeyPaths(@_keyPaths)

  getChildProps: ->
    keyPaths = _.extend {}, @_keyPaths

    _.extend {}, @_props,
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