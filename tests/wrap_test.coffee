React = require "react/addons"
Immutable = require "immutable"
{TestUtils} = React.addons

Tide = require "base"
wrap = require "wrap"

describe "wrap", ->
  beforeEach ->
    @tideInstance = new Tide

  it "wraps the given component class with a tide component", ->
    Child = React.createClass
      render: ->
        @props.tide.should.exist
        null

    Wrapped = wrap Child, tide: @tideInstance
    TestUtils.renderIntoDocument React.createElement(Wrapped)

  it "passes the given props to the tide component", ->
    @tideInstance.setState Immutable.Map(foo: "bar")

    Child = React.createClass
      render: ->
        @props.stateProp.should.equal "bar"
        null

    Wrapped = wrap Child, tide: @tideInstance, stateProp: "foo"
    TestUtils.renderIntoDocument React.createElement(Wrapped)

  it "passes props given to the wrap component to the child", ->
    Child = React.createClass
      render: ->
        @props.childProp.should.equal "foo"
        null

    Wrapped = wrap Child, tide: @tideInstance
    TestUtils.renderIntoDocument React.createElement(Wrapped, childProp: "foo")
