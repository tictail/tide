React = require "react"
shallowEqual = require "react-pure-render/shallowEqual"
assign = require "lodash.assign"

TideComponent = require "./component"

module.exports = (componentClass, tideProps = {}) ->
  isImpure = tideProps.impure
  tideProps = assign {}, tideProps, impure: true

  React.createClass
    shouldComponentUpdate: (nextProps) ->
      return true if isImpure
      not shallowEqual @props, nextProps

    render: ->
      React.createElement(TideComponent, tideProps,
        React.createElement(componentClass, @props)
      )
