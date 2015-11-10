React = require "react/addons"
Sinon = require "sinon"
Immutable = require "immutable"
assign = require "lodash.assign"
{TestUtils} = React.addons

Tide = require "base"
wrap = require "wrap"

describe "wrap", ->
  beforeEach ->
    @tideInstance = new Tide

  createWrappedComponent = (tideInstance, renderSpy, tideProps = {}) ->
    Child = React.createClass
      render: ->
        renderSpy?.call this
        null

    wrap Child, assign({tide: tideInstance}, tideProps)

  it "wraps the given component class with a tide component", ->
    spy = Sinon.spy()

    Wrapped = createWrappedComponent @tideInstance, ->
      spy @props.tide

    TestUtils.renderIntoDocument React.createElement(Wrapped)
    spy.firstCall.args[0].should.exist

  it "passes the given props to the tide component", ->
    @tideInstance.setState Immutable.Map(foo: "bar")
    spy = Sinon.spy()

    Wrapped = createWrappedComponent @tideInstance, ->
      spy @props.stateProp
    , stateProp: "foo"

    TestUtils.renderIntoDocument React.createElement(Wrapped)
    spy.firstCall.args[0].should.equal "bar"

  it "passes props given to the wrap component to the child", ->
    spy = Sinon.spy()

    Wrapped = createWrappedComponent @tideInstance, ->
      spy @props.childProp

    TestUtils.renderIntoDocument React.createElement(Wrapped, childProp: "foo")
    spy.firstCall.args[0].should.equal "foo"

  it "re-renders the child when given new props", ->
    spy = Sinon.spy()

    Wrapped = createWrappedComponent @tideInstance, ->
      spy @props.childProp

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

    Wrapped = createWrappedComponent @tideInstance, ->
      spy @props.childProp

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

    Wrapped = createWrappedComponent @tideInstance, ->
      spy @props.childProp
    , impure: true

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

