/* eslint-disable react/no-multi-comp */
import React from 'react'
import Immutable from 'immutable'
import TestUtils from 'react-dom/test-utils'

import Tide from 'base'
import wrap from 'wrap'

let tideInstance

describe('wrap', function() {
  let parentSetState
  beforeEach(function() {
    tideInstance = new Tide()
    parentSetState = null
  })

  function createWrappedComponent(tideInstance, renderSpy, tideProps = {}, mappers) {
    class Child extends React.Component {
      render() {
        renderSpy && renderSpy.call(this)
        return null
      }
    }

    return wrap(Child, {tide: tideInstance, ...tideProps}, mappers)
  }

  function getParent(Wrapped) {
    return class Parent extends React.Component {
      state = {childProp: 'bar'}
      componentDidMount() {
        parentSetState = this.setState.bind(this)
      }
      render() {
        return React.createElement(Wrapped, this.state)
      }
    }
  }

  it('wraps the given component class with a tide component', function() {
    const spy = jest.fn()

    const Wrapped = createWrappedComponent(tideInstance, function() {
      return spy(this.props.tide)
    })

    TestUtils.renderIntoDocument(<Wrapped />)
    expect(spy.mock.calls[0][0]).toBeTruthy()
  })

  it('passes the given props to the tide component', function() {
    tideInstance.setState(Immutable.Map({foo: 'bar'}))
    const spy = jest.fn()

    const Wrapped = createWrappedComponent(tideInstance, function() {
      return spy(this.props.stateProp)
    }
    , {stateProp: 'foo'})

    TestUtils.renderIntoDocument(<Wrapped />)
    expect(spy.mock.calls[0][0]).toBe('bar')
  })

  it('passes props given to the wrap component to the child', function() {
    const spy = jest.fn()

    const Wrapped = createWrappedComponent(tideInstance, function() {
      return spy(this.props.childProp)
    })

    TestUtils.renderIntoDocument(React.createElement(Wrapped, {childProp: 'foo'}))
    expect(spy.mock.calls[0][0]).toBe('foo')
  })

  it('re-renders the child when given new props', function() {
    const spy = jest.fn()

    const Wrapped = createWrappedComponent(tideInstance, function() {
      return spy(this.props.childProp)
    })
    const Parent = getParent(Wrapped)

    TestUtils.renderIntoDocument(React.createElement(Parent))

    expect(spy).toHaveBeenCalledWith('bar')
    parentSetState({childProp: 'foo'})
    expect(spy).toHaveBeenCalledWith('foo')
  })

  it('does not re-render the child when given the same props', function(done) {
    const spy = jest.fn()

    const Wrapped = createWrappedComponent(tideInstance, function() {
      return spy(this.props.childProp)
    })
    const Parent = getParent(Wrapped)

    TestUtils.renderIntoDocument(React.createElement(Parent))

    expect(spy).toHaveBeenCalledTimes(1)
    parentSetState({childProp: 'bar'}, () => {
      expect(spy).toHaveBeenCalledTimes(1)
      done()
    })
  })

  it('always re-renders when impure is true', function(done) {
    const spy = jest.fn()

    const Wrapped = createWrappedComponent(tideInstance, function() {
      return spy(this.props.childProp)
    }
    , {impure: true})
    const Parent = getParent(Wrapped)

    TestUtils.renderIntoDocument(React.createElement(Parent))
    expect(spy).toHaveBeenCalledTimes(1)
    parentSetState({childProp: 'foo'}, () => {
      expect(spy).toHaveBeenCalledTimes(2)
      done()
    })
  })

  it('passes props through supplied mappers', function(done) {
    tideInstance.setState(Immutable.Map({foo: 'bar', bar: 'baz', hi: 'mate'}))
    const spy = jest.fn()

    const Wrapped = createWrappedComponent(tideInstance, function() {
      expect(this.props.hi).toBe(undefined)
      return spy(this.props)
    }, {foo: 'foo', bar: 'bar'}, {
      foo: (val) => 'mapped_' + val,
    })
    const Parent = getParent(Wrapped)

    TestUtils.renderIntoDocument(React.createElement(Parent))

    expect(spy).toHaveBeenCalledTimes(1)
    parentSetState({childProp: 'foo'}, () => {
      expect(spy).toHaveBeenCalledTimes(2)
      expect(spy).toHaveBeenCalledWith({
        'bar': 'baz',
        'childProp': 'bar',
        'foo': 'mapped_bar',
        'tide': {
          'keyPaths': {
            'bar': ['bar'],
            'foo': ['foo']
          },
          'options': {}
        }
      })
      done()
    })
  })
})

