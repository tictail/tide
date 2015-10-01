Sinon = require "sinon"
React = require "react/addons"
TestUtils = React.addons.TestUtils
Immutable = require "immutable"

Tide = require "tide"
TideComponent = require "tide/component"

describe "TideComponent", ->
  beforeEach ->
    @tide = new Tide

  createComponent = (render) ->
    React.createElement React.createClass(
      render: ->
        render.apply this
        null
    )

  describe "Context", ->
    it "passes down the given tide instance in the context", ->
      tide = @tide
      Child = React.createClass
        contextTypes:
          tide: React.PropTypes.object

        render: ->
          @context.tide.should.equal tide
          null

      tree = React.createElement TideComponent, {tide: @tide}, React.createElement(Child)
      TestUtils.renderIntoDocument tree

  describe "Props", ->
    it "passes down the data of the given key paths as props to the child", ->
      Child = createComponent ->
        @props.foo.should.equal "foo"
        @props.bar.should.equal "bar"

      state = Immutable.fromJS
        nested:
          foo: "foo"
          bar: "bar"

      @tide.setState state
      tree = React.createElement TideComponent, {
        tide: @tide
        foo: ["nested", "foo"]
        bar: ["nested", "bar"]
      }, Child

      TestUtils.renderIntoDocument tree

    it "accepts dot notation instead of an array for key paths", ->
      Child = createComponent ->
        @props.foo.should.equal "foo"

      state = Immutable.fromJS nested: foo: "foo"

      @tide.setState state
      tree = React.createElement TideComponent, {
        tide: @tide
        foo: "nested.foo"
      }, Child

      TestUtils.renderIntoDocument tree

    it "accepts setting key path to true to have it mirror the prop name", ->
      Child = createComponent ->
        @props.foo.should.equal "foo"

      state = Immutable.fromJS foo: "foo"

      @tide.setState state
      tree = React.createElement TideComponent, {
        tide: @tide
        foo: true
      }, Child

      TestUtils.renderIntoDocument tree

    it "converts to native JS object if 'toJS()' is given in key path", ->
      Child = createComponent ->
        @props.nested.should.deep.equal foo: "foo"

      state = Immutable.fromJS nested: foo: "foo"

      @tide.setState state
      tree = React.createElement TideComponent, {
        tide: @tide
        nested: "nested.toJS()"
      }, Child

      TestUtils.renderIntoDocument tree

    it "passes down props to multiple children", ->
      Child = createComponent ->
        @props.foo.should.equal "foo"

      @tide.setState Immutable.Map(foo: "foo")

      tree = React.createElement TideComponent, {
        tide: @tide
        foo: ["foo"]
      }, Child, Child

      TestUtils.renderIntoDocument tree

    it "passes down actions in the `tide` prop", ->
      @tide.addActions "foo", Object
      actions = @tide.getActions "foo"

      Child = createComponent ->
        @props.tide.actions.foo.should.equal actions

      tree = React.createElement TideComponent, {tide: @tide}, Child
      TestUtils.renderIntoDocument tree

    it "passes down keyPaths in the `tide` prop", ->
      Child = createComponent ->
        @props.tide.keyPaths.foo.should.deep.equal ["nested", "foo"]

      @tide.setState Immutable.Map()
      tree = React.createElement TideComponent, {tide: @tide, foo: ["nested", "foo"]}, Child
      TestUtils.renderIntoDocument tree

  describe "Updates", ->
    it "re-renders when the data in any of the listened paths in the state has changed", ->
      spy = Sinon.spy()
      Child = createComponent spy
      @tide.setState Immutable.Map(foo: "foo")

      tree = React.createElement TideComponent, {tide: @tide, foo: ["foo"]}, Child
      TestUtils.renderIntoDocument tree
      (-> spy.callCount).should.increase.when =>
        @tide.updateState (state) -> state.set "foo", "bar"

    it "does not re-render if none of the listened to data has changed on an update", ->
      spy = Sinon.spy()
      Child = createComponent spy
      @tide.setState Immutable.Map(foo: "foo", bar: "bar")

      tree = React.createElement TideComponent, {tide: @tide, foo: ["foo"]}, Child
      TestUtils.renderIntoDocument tree
      (-> spy.callCount).should.not.increase.when =>
        @tide.updateState (state) -> state.set "bar", "foo"

    it "does not re-render if something outside of the listened state updates", ->
      tide = @tide
      spy = Sinon.spy()

      Child = React.createClass
        render: ->
          spy()
          null

      parentSetState = null
      Parent = React.createClass
        getInitialState: ->
          foo: "foo"

        componentDidMount: ->
          parentSetState = @setState.bind this

        render: ->
          child = React.createElement Child, @state
          React.createElement TideComponent, {tide: tide}, child

      TestUtils.renderIntoDocument React.createElement(Parent)

      (-> spy.callCount).should.not.increase.when ->
        parentSetState foo: "bar"

    it "always re-renders if given the `impure` property", ->
      tide = @tide
      spy = Sinon.spy()
      Child = createComponent spy

      parentSetState = null
      Parent = React.createClass
        getInitialState: ->
          foo: "foo"

        componentDidMount: ->
          parentSetState = @setState.bind this

        render: ->
          React.createElement TideComponent, {tide: tide, impure: true}, Child

      TestUtils.renderIntoDocument React.createElement(Parent)

      (-> spy.callCount).should.increase.when ->
        parentSetState foo: "bar"
