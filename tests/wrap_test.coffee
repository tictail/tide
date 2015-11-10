React = require "react/addons"
Sinon = require "sinon"
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

  it "re-renders the child when given new props", ->
    spy = Sinon.spy()
    Child = React.createClass
      render: ->
        spy @props.childProp
        null

    Wrapped = wrap Child, tide: @tideInstance

    parentSetState = null
    Parent = React.createClass
      getInitialState: ->
        childProp: "foo"

      componentDidMount: ->
        parentSetState = @setState.bind this

      render: ->
        React.createElement Wrapped, @state

    TestUtils.renderIntoDocument React.createElement(Parent)

    spy.should.have.been.calledWith "foo"
    parentSetState childProp: "bar"
    spy.should.have.been.calledWith "bar"

  it "does not re-render the child when given the same props", ->
    spy = Sinon.spy()
    Child = React.createClass
      render: ->
        spy @props.childProp
        null

    Wrapped = wrap Child, tide: @tideInstance

    parentSetState = null
    Parent = React.createClass
      getInitialState: ->
        childProp: "foo"

      componentDidMount: ->
        parentSetState = @setState.bind this

      render: ->
        React.createElement Wrapped, @state

    TestUtils.renderIntoDocument React.createElement(Parent)

    (-> spy.callCount).should.not.increase.when ->
      parentSetState childProp: "foo"

  it "always re-renders when impure is true", ->
    spy = Sinon.spy()
    Child = React.createClass
      render: ->
        spy @props.childProp
        null

    Wrapped = wrap Child, tide: @tideInstance, impure: true

    parentSetState = null
    Parent = React.createClass
      getInitialState: ->
        childProp: "foo"

      componentDidMount: ->
        parentSetState = @setState.bind this

      render: ->
        React.createElement Wrapped, @state

    TestUtils.renderIntoDocument React.createElement(Parent)

    (-> spy.callCount).should.increase.when ->
      parentSetState childProp: "foo"

