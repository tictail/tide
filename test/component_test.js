/* eslint-disable react/no-multi-comp, react/display-name */
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import PropTypes from 'prop-types'
import Immutable from 'immutable'

import Tide from 'base'
import Component from 'component'

let tideInstance

describe('Component', function() {
  beforeEach(function() {
    tideInstance = new Tide()
  })

  const createComponent = (render) => (props) => {
    return React.createElement(React.createClass({
      render() {
        this.props = {...this.props, ...props}
        render.apply(this)
        return null
      }
    }))
  }
  describe('Context', function() {
    it('passes down the given tide instance in the context', function() {
      const Child = React.createClass({
        contextTypes: {
          tide: PropTypes.object
        },

        render() {
          expect(this.context.tide).toBe(tideInstance)
          return null
        }
      })

      const tree = React.createElement(Component, {tide: tideInstance},
        ({tide, ...props}) => React.createElement('div', props,
          React.createElement(Component, {},
            (props) => React.createElement(Child, props)
          )
        )
      )
      TestUtils.renderIntoDocument(tree)
    })

    it(
      'uses tide from context instead of props when directly nesting multiple components',
      function() {
        const Child = React.createClass({
          contextTypes: {
            tide: PropTypes.object
          },

          render() {
            expect(this.context.tide).toBe(tideInstance)
            return null
          }
        })

        const tree = React.createElement(Component, {tide: tideInstance},
          (props) => React.createElement(Component, {},
            (props) => React.createElement(Child, props)
          )
        )
        TestUtils.renderIntoDocument(tree)
      }
    )
  })

  describe('Props', function() {
    it('passes down the data of the given key paths as props to the child', function() {
      const Child = createComponent(function() {
        expect(this.props.foo).toEqual('foo')
        expect(this.props.bar).toEqual('bar')
      })

      const state = Immutable.fromJS({
        nested: {
          foo: 'foo',
          bar: 'bar'
        }
      })

      tideInstance.setState(state)
      const tree = React.createElement(Component, {
        tide: tideInstance,
        foo: ['nested', 'foo'],
        bar: ['nested', 'bar']
      }, Child)

      TestUtils.renderIntoDocument(tree)
    })

    it('accepts dot notation instead of an array for key paths', function() {
      const Child = createComponent(function() {
        expect(this.props.foo).toEqual('foo')
      })

      const state = Immutable.fromJS({nested: {foo: 'foo'}})

      tideInstance.setState(state)
      const tree = React.createElement(Component, {
        tide: tideInstance,
        foo: 'nested.foo'
      }, Child)

      TestUtils.renderIntoDocument(tree)
    })

    it('accepts setting key path to true to have it mirror the prop name', function() {
      const Child = createComponent(function() {
        expect(this.props.foo).toEqual('foo')
      })

      const state = Immutable.fromJS({foo: 'foo'})

      tideInstance.setState(state)
      const tree = React.createElement(Component, {
        tide: tideInstance,
        foo: true
      }, Child)

      TestUtils.renderIntoDocument(tree)
    })

    it('accepts functions to create keypaths based on the current state', function() {
      const Child = createComponent(function() {
        expect(this.props.fooPointer).toEqual('foo')
      })

      const state = Immutable.fromJS({foo: 'foo', path: 'foo'})

      tideInstance.setState(state)
      const tree = React.createElement(Component, {
        tide: tideInstance,
        fooPointer(state) { return [state.get('path')] }
      }, Child)

      TestUtils.renderIntoDocument(tree)
    })

    it('passes down keyPaths in the `tide` prop', function() {
      const Child = createComponent(function() {
        expect(this.props.tide.keyPaths.foo).toEqual(['nested', 'foo'])
      })

      tideInstance.setState(Immutable.Map())
      const tree = React.createElement(
        Component, {tide: tideInstance, foo: ['nested', 'foo']}, Child
      )
      TestUtils.renderIntoDocument(tree)
    })

    it('doesn\'t pass props that are undefined', function() {
      const Child = createComponent(function() {
        expect(this.props.hasOwnProperty('foo')).toBe(false)
      })

      tideInstance.setState(Immutable.Map())
      const tree = React.createElement(Component, {
        tide: tideInstance,
        foo: ['non-existing-state-path']
      }, Child)
      TestUtils.renderIntoDocument(tree)
    })
  })

  describe('Updates', function() {
    it(
      're-renders when the data in any of the listened paths in the state has changed',
      function(done) {
        const spy = jest.fn()
        const Child = createComponent(spy)
        tideInstance.setState(Immutable.Map({foo: 'foo'}))

        const tree = React.createElement(Component, {tide: tideInstance, foo: ['foo']}, Child)
        TestUtils.renderIntoDocument(tree)
        expect(spy).toHaveBeenCalledTimes(1)
        tideInstance.updateState(state => state.set('foo', 'bar'))
        return setTimeout(function() {
          expect(spy).toHaveBeenCalledTimes(2)
          done()
        }, 0)
      }
    )

    it('re-renders when a dynamic key path changes', function(done) {
      const spy = jest.fn()
      const Child = createComponent(function() {
        return spy(this.props.pointer)
      })

      tideInstance.setState(Immutable.Map({
        foo: 'foo',
        bar: 'bar',
        path: 'foo'
      })
      )

      const tree = React.createElement(Component, {
        tide: tideInstance,
        pointer(state) { return [state.get('path')] }
      }, Child)

      TestUtils.renderIntoDocument(tree)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith('foo')
      tideInstance.updateState(state => state.set('path', 'bar'))
      return setTimeout(function() {
        expect(spy).toHaveBeenCalledTimes(2)
        expect(spy).toHaveBeenCalledWith('bar')
        done()
      }, 0)
    })

    it(
      'does not re-render if none of the listened to data has changed on an update',
      function(done) {
        const spy = jest.fn()
        const Child = createComponent(spy)
        tideInstance.setState(Immutable.Map({foo: 'foo', bar: 'bar'}))

        const tree = React.createElement(Component, {tide: tideInstance, foo: ['foo']}, Child)
        TestUtils.renderIntoDocument(tree)
        expect(spy).toHaveBeenCalledTimes(1)
        setTimeout(function() {
          expect(spy).toHaveBeenCalledTimes(1)
          done()
        }, 0)
      }
    )

    it('does not re-render if something outside of the listened state updates', function(done) {
      const childRenderSpy = jest.fn()

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
          return React.createElement(Component, {tide: tideInstance}, () => child)
        }
      })

      TestUtils.renderIntoDocument(React.createElement(Parent))

      expect(childRenderSpy).toHaveBeenCalledTimes(1)
      parentSetState({foo: 'bar'}, function() {
        expect(childRenderSpy).toHaveBeenCalledTimes(2)
        done()
      })
    })

    it('always re-renders if given the `impure` property', function(done) {
      const spy = jest.fn()
      const Child = createComponent(spy)
      tideInstance.setState(Immutable.Map({foo: 'foo', bar: 'bar'}))

      let parentSetState = null
      const Parent = React.createClass({
        getInitialState() {
          return {foo: 'foo'}
        },

        componentDidMount() {
          parentSetState = this.setState.bind(this)
        },

        render() {
          return React.createElement(Component, {tide: tideInstance, impure: true}, Child)
        }
      })

      expect(spy).toHaveBeenCalledTimes(0)
      TestUtils.renderIntoDocument(React.createElement(Parent))
      expect(spy).toHaveBeenCalledTimes(1)
      parentSetState({foo: 'bar'}, function() {
        expect(spy).toHaveBeenCalledTimes(2)
        done()
      })
    })
  })
})
