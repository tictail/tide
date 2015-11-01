React = require "react"
TideComponent = require "./component"

module.exports = (componentClass, tideProps) ->
  React.createClass
    render: ->
      React.createElement(TideComponent, tideProps,
        React.createElement(componentClass, @props)
      )
