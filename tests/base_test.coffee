Sinon = require "sinon"
React = require "react/addons"
TestUtils = React.addons.TestUtils
Immutable = require "immutable"

Tide = require "base"
Actions = require "actions"
TideComponent = require "component"

describe "Tide", ->
  beforeEach ->
    @sandbox = Sinon.sandbox.create()
    @sandbox.stub console, "log"
    @tideInstance = new Tide

  afterEach ->
    @sandbox.restore()

  describe "#enableLogging", ->
    it "logs action calls when `actions` is true", ->
      spy = Sinon.spy()
      class FooActions extends Actions
        bar: spy

      @tideInstance.addActions "foo", FooActions
      @tideInstance.enableLogging actions: true

      @tideInstance.getActions("foo").bar "hello", "world"
      console.log.should.have.been.calledWith "%cAction performed", "font-weight: bold;", "foo.bar", "hello", "world"
      spy.should.have.been.calledWith "hello", "world"

    it "logs state updates when `state` is true", ->
      @sandbox.stub console, "group"
      @sandbox.stub console, "groupEnd"

      @tideInstance.setState Immutable.Map(foo: "baz")
      @tideInstance.enableLogging state: true
      @tideInstance.setState Immutable.Map(foo: "bar")

      console.group.should.have.been.calledWith "%cState mutation", "font-weight: bold;"
      console.log.should.have.been.calledWith "%cCurrent state", "color: gray; font-weight: bold; %O", {foo: "baz"}
      console.log.should.have.been.calledWith "%cOperation", "font-weight: bold;", "replace", "/foo", "bar"
      console.log.should.have.been.calledWith "%cNext state", "color: green; font-weight: bold; %O",  {foo: "bar"}
      console.groupEnd.should.have.been.calledWith()

    it "logs component re-renders from state change when `components` is true", ->
      @tideInstance.enableLogging components: true
      @tideInstance.setState Immutable.Map(foo: "foo")

      domNode = undefined
      Child = React.createClass
        componentDidMount: ->
          domNode = React.findDOMNode this
        render: ->
          React.createElement "div", {}, "Hello World"

      tree = React.createElement TideComponent, {
        tide: @tideInstance
        foo: ["foo"]
      }, React.createElement(Child)

      TestUtils.renderIntoDocument tree
      @tideInstance.updateState (state) -> state.set "foo", "bar"

      console.log.should.have.been.calledWith "%cComponent", "font-weight: bold;", "Re-render from state", domNode

    it "logs component re-renders from parent change when `components` is true", ->
      @tideInstance.enableLogging components: true
      @tideInstance.setState Immutable.Map(foo: "foo")

      domNode = undefined
      forceUpdate = undefined
      tideInstance = @tideInstance

      Child = React.createClass
        componentDidMount: ->
          domNode = React.findDOMNode this
        render: ->
          React.createElement "div", {}, "Hello World"

      Parent = React.createClass
        render: ->
          forceUpdate = @forceUpdate.bind this
          React.createElement TideComponent, {
            tide: tideInstance
            foo: ["foo"]
            impure: true
          }, React.createElement(Child)

      TestUtils.renderIntoDocument React.createElement(Parent)
      forceUpdate()
      console.log.should.have.been.calledWith "%cComponent", "font-weight: bold;", "Re-render from parent", domNode

  describe "#addActions", ->
    it "instantiates the given class with the tide instance as the first argument", ->
      spy = Sinon.spy()
      class DummyClass
        constructor: spy

      @tideInstance.addActions "dummy", DummyClass
      spy.should.have.been.calledWith @tideInstance

  describe "#getActions", ->
    it "gets a specific actions instance when given a name", ->
      @tideInstance.addActions "foo", Object
      @tideInstance.getActions("foo").should.exist

    it "returns all actions when name is left empty", ->
      @tideInstance.addActions "foo", Object
      @tideInstance.addActions "bar", Object
      @tideInstance.getActions().should.have.keys ["foo", "bar"]

  describe "#updateState", ->
    it "calls the given updater with the state as the first argument", ->
      @tideInstance.setState {foo: "bar"}
      updater = Sinon.stub().returns @tideInstance.getState()
      @tideInstance.updateState updater
      updater.should.have.been.calledWith @tideInstance.getState()

    it "sets the state from the return value of the updater", ->
      @tideInstance.updateState -> "foobar"
      @tideInstance.getState().should.equal "foobar"

  describe "#mutate", ->
    beforeEach ->
      @tideInstance.setState Immutable.fromJS(foo: bar: "baz")

    it "mutates the given path to the supplied value", ->
      @tideInstance.mutate(['foo', 'bar'], 'xyz')
      @tideInstance.getState().getIn(['foo', 'bar']).should.equal 'xyz'

    it "mutates the given stringified path to the supplied value", ->
      @tideInstance.mutate('foo.bar', 'xyz')
      @tideInstance.getState().getIn(['foo', 'bar']).should.equal 'xyz'

    it "mutates the given path with the result of the mutator", ->
      @tideInstance.mutate(['foo', 'bar'], (existing) -> existing.toUpperCase())
      @tideInstance.getState().getIn(['foo', 'bar']).should.equal 'BAZ'

  describe "#get", ->
    it "allows you to get a value in state", ->
      @tideInstance.setState Immutable.fromJS(foo: 'bar')
      @tideInstance.get('foo').should.equal 'bar'

    it "allows you to get a path in state", ->
      @tideInstance.setState Immutable.fromJS(foo: bar: 'baz')
      @tideInstance.get(['foo', 'bar']).should.equal 'baz'

    it "allows you to get a nested value in state via dot notation", ->
      @tideInstance.setState Immutable.fromJS(foo: bar: 'baz')
      @tideInstance.get('foo.bar').should.equal 'baz'

  describe "#onChange", ->
    it "registers a listener to the change event", ->
      callback = Sinon.spy()
      @tideInstance.onChange callback
      (-> callback.callCount).should.change.from(0).to(1).when =>
        @tideInstance.emitChange()

  describe "#offChange", ->
    it "unregisters the given listener from the change event", ->
      callback = Sinon.spy()
      @tideInstance.onChange callback
      @tideInstance.offChange callback
      (-> callback.callCount).should.not.change.when =>
        @tideInstance.emitChange()

  describe "::wrap", ->
    it "wraps the given component class with a tide component", ->
      Child = React.createClass
        render: ->
          @props.tide.should.exist
          null

      Wrapped = Tide.wrap Child, tide: @tideInstance
      TestUtils.renderIntoDocument React.createElement(Wrapped)

    it "passes the given props to the tide component", ->
      @tideInstance.setState Immutable.Map(foo: "bar")

      Child = React.createClass
        render: ->
          @props.stateProp.should.equal "bar"
          null

      Wrapped = Tide.wrap Child, tide: @tideInstance, stateProp: "foo"
      TestUtils.renderIntoDocument React.createElement(Wrapped)

    it "passes props given to the wrap component to the child", ->
      Child = React.createClass
        render: ->
          @props.childProp.should.equal "foo"
          null

      Wrapped = Tide.wrap Child, tide: @tideInstance
      TestUtils.renderIntoDocument React.createElement(Wrapped, childProp: "foo")
