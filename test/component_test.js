/* eslint-disable react/no-multi-comp */
import Sinon from 'sinon'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Immutable from 'immutable'

import Tide from 'base'
import TideComponent from 'component'

describe('TideComponent', function() {
  beforeEach(function() {
    this.tide = new Tide()
  })

  const createComponent = (render) =>
    React.createElement(React.createClass({
      render() {
        render.apply(this)
        return null
      }
    })
    )

  describe('Context', function() {
    it('passes down the given tide instance in the context', function() {
      const {tide} = this
      const Child = React.createClass({
        contextTypes: {
          tide: React.PropTypes.object
        },

        render() {
          this.context.tide.should.equal(tide)
          return null
        }
      })

      const tree = React.createElement(TideComponent, {tide: this.tide},
        React.createElement('div', {},
          React.createElement(TideComponent, {},
            React.createElement(Child)
          )
        )
      )
      return TestUtils.renderIntoDocument(tree)
    })

    it(
      'uses tide from context instead of props when directly nesting multiple components',
      function() {
        const {tide} = this
        const Child = React.createClass({
          contextTypes: {
            tide: React.PropTypes.object
          },

          render() {
            this.context.tide.should.equal(tide)
            return null
          }
        })

        const tree = React.createElement(TideComponent, {tide: this.tide},
          React.createElement(TideComponent, {},
            React.createElement(Child)
          )
        )
        return TestUtils.renderIntoDocument(tree)
      }
    )
  })

  describe('Props', function() {
    it('passes down the data of the given key paths as props to the child', function() {
      const Child = createComponent(function() {
        this.props.foo.should.equal('foo')
        return this.props.bar.should.equal('bar')
      })

      const state = Immutable.fromJS({
        nested: {
          foo: 'foo',
          bar: 'bar'
        }
      })

      this.tide.setState(state)
      const tree = React.createElement(TideComponent, {
        tide: this.tide,
        foo: ['nested', 'foo'],
        bar: ['nested', 'bar']
      }, Child)

      return TestUtils.renderIntoDocument(tree)
    })

    it('accepts dot notation instead of an array for key paths', function() {
      const Child = createComponent(function() {
        return this.props.foo.should.equal('foo')
      })

      const state = Immutable.fromJS({nested: {foo: 'foo'
    }})

      this.tide.setState(state)
      const tree = React.createElement(TideComponent, {
        tide: this.tide,
        foo: 'nested.foo'
      }, Child)

      return TestUtils.renderIntoDocument(tree)
    })

    it('accepts setting key path to true to have it mirror the prop name', function() {
      const Child = createComponent(function() {
        return this.props.foo.should.equal('foo')
      })

      const state = Immutable.fromJS({foo: 'foo'})

      this.tide.setState(state)
      const tree = React.createElement(TideComponent, {
        tide: this.tide,
        foo: true
      }, Child)

      return TestUtils.renderIntoDocument(tree)
    })

    it('accepts functions to create keypaths based on the current state', function() {
      const Child = createComponent(function() {
        return this.props.fooPointer.should.equal('foo')
      })

      const state = Immutable.fromJS({foo: 'foo', path: 'foo'})

      this.tide.setState(state)
      const tree = React.createElement(TideComponent, {
        tide: this.tide,
        fooPointer(state) { return [state.get('path')] }
      }, Child)

      return TestUtils.renderIntoDocument(tree)
    })

    it('converts to native JS object if \'toJS()\' is given in key path', function() {
      const Child = createComponent(function() {
        return this.props.nested.should.deep.equal({foo: 'foo'})
      })

      const state = Immutable.fromJS({nested: {foo: 'foo'
    }})

      this.tide.setState(state)
      const tree = React.createElement(TideComponent, {
        tide: this.tide,
        nested: 'nested.toJS()'
      }, Child)

      return TestUtils.renderIntoDocument(tree)
    })

    it('passes down props to multiple children', function() {
      const Child = createComponent(function() {
        return this.props.foo.should.equal('foo')
      })

      this.tide.setState(Immutable.Map({foo: 'foo'}))

      const tree = React.createElement(TideComponent, {
        tide: this.tide,
        foo: ['foo']
      }, Child, Child)

      return TestUtils.renderIntoDocument(tree)
    })

    it('passes down actions in the `tide` prop', function() {
      this.tide.addActions('foo', Object)
      const actions = this.tide.getActions('foo')

      const Child = createComponent(function() {
        return this.props.tide.actions.foo.should.equal(actions)
      })

      const tree = React.createElement(TideComponent, {tide: this.tide}, Child)
      return TestUtils.renderIntoDocument(tree)
    })

    it('passes down keyPaths in the `tide` prop', function() {
      const Child = createComponent(function() {
        return this.props.tide.keyPaths.foo.should.deep.equal(['nested', 'foo'])
      })

      this.tide.setState(Immutable.Map())
      const tree = React.createElement(
        TideComponent, {tide: this.tide, foo: ['nested', 'foo']}, Child
      )
      return TestUtils.renderIntoDocument(tree)
    })

    return it('doesn\'t pass props that are undefined', function() {
      const Child = createComponent(function() {
        return this.props.hasOwnProperty('foo').should.be.false
      })

      this.tide.setState(Immutable.Map())
      const tree = React.createElement(TideComponent, {
        tide: this.tide,
        foo: ['non-existing-state-path']
      }, Child)
      return TestUtils.renderIntoDocument(tree)
    })
  })

  describe('Updates', function() {
    it(
      're-renders when the data in any of the listened paths in the state has changed',
      function(done) {
        const spy = Sinon.spy()
        const Child = createComponent(spy)
        this.tide.setState(Immutable.Map({foo: 'foo'}))

        const tree = React.createElement(TideComponent, {tide: this.tide, foo: ['foo']}, Child)
        TestUtils.renderIntoDocument(tree);
        (spy.callCount).should.equal(1)
        this.tide.updateState(state => state.set('foo', 'bar'))
        return setTimeout(function() {
          (spy.callCount).should.equal(2)
          done()
        }, 0)
      }
    )

    it('re-renders when a dynamic key path changes', function(done) {
      const spy = Sinon.spy()
      const Child = createComponent(function() {
        return spy(this.props.pointer)
      })

      this.tide.setState(Immutable.Map({
        foo: 'foo',
        bar: 'bar',
        path: 'foo'
      })
      )

      const tree = React.createElement(TideComponent, {
        tide: this.tide,
        pointer(state) { return [state.get('path')] }
      }, Child)

      TestUtils.renderIntoDocument(tree);
      (spy.callCount).should.equal(1)
      spy.should.have.been.calledWith('foo')
      this.tide.updateState(state => state.set('path', 'bar'))
      return setTimeout(function() {
        (spy.callCount).should.equal(2)
        spy.should.have.been.calledWith('bar')
        done()
      }, 0)
    })

    it(
      'does not re-render if none of the listened to data has changed on an update',
      function(done) {
        const spy = Sinon.spy()
        const Child = createComponent(spy)
        this.tide.setState(Immutable.Map({foo: 'foo', bar: 'bar'}))

        const tree = React.createElement(TideComponent, {tide: this.tide, foo: ['foo']}, Child)
        TestUtils.renderIntoDocument(tree);
        (spy.callCount).should.equal(1)
        setTimeout(function() {
          (spy.callCount).should.equal(1)
          done()
        }, 0)
      }
    )

    it('does not re-render if something outside of the listened state updates', function(done) {
      const {tide} = this
      const childRenderSpy = Sinon.spy()

      const Child = React.createClass({
        render() {
          childRenderSpy()
          return null
        }
      })

      let parentSetState = null
      const Parent = React.createClass({
        getInitialState() {
          return {foo: 'foo'}
        },

        componentDidMount() {
          parentSetState = this.setState.bind(this)
        },

        render() {
          const child = React.createElement(Child, this.state)
          return React.createElement(TideComponent, {tide}, child)
        }
      })

      TestUtils.renderIntoDocument(React.createElement(Parent))

      childRenderSpy.callCount.should.equal(1)
      parentSetState({foo: 'bar'}, () => {
        childRenderSpy.callCount.should.equal(2)
        done()
      })
    })

    return it('always re-renders if given the `impure` property', function() {
      const {tide} = this
      const spy = Sinon.spy()
      const Child = createComponent(spy)

      let parentSetState = null
      const Parent = React.createClass({
        getInitialState() {
          return {foo: 'foo'}
        },

        componentDidMount() {
          parentSetState = this.setState.bind(this)
        },

        render() {
          return React.createElement(TideComponent, {tide, impure: true}, Child)
        }
      })

      TestUtils.renderIntoDocument(React.createElement(Parent))

      return (() => spy.callCount).should.increase.when(() => parentSetState({foo: 'bar'}))
    })
  })
})
