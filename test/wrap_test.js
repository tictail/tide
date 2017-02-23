/* eslint-disable react/no-multi-comp */
import React from 'react'
import Immutable from 'immutable'
import TestUtils from 'react-addons-test-utils'

import {Tide} from 'base'
import {wrap} from 'wrap'

let tideInstance

describe('wrap', function() {
  beforeEach(function() {
    tideInstance = new Tide()
  })

  function createWrappedComponent(tideInstance, renderSpy, tideProps = {}) {
    class Child extends React.Component {
      render() {
        renderSpy && renderSpy.call(this)
        return null
      }
    }

    return wrap(Child, {tide: tideInstance, ...tideProps})
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

    let parentSetState = null
    const Parent = React.createClass({
      getInitialState() {
        return {childProp: 'foo'}
      },

      componentDidMount() {
        parentSetState = this.setState.bind(this)
      },

      render() {
        return React.createElement(Wrapped, this.state)
      }
    })

    TestUtils.renderIntoDocument(React.createElement(Parent))

    expect(spy).toHaveBeenCalledWith('foo')
    parentSetState({childProp: 'bar'})
    expect(spy).toHaveBeenCalledWith('bar')
  })

  it('does not re-render the child when given the same props', function(done) {
    const spy = jest.fn()

    const Wrapped = createWrappedComponent(tideInstance, function() {
      return spy(this.props.childProp)
    })

    let parentSetState = null
    const Parent = React.createClass({
      getInitialState() {
        return {childProp: 'foo'}
      },

      componentDidMount() {
        parentSetState = this.setState.bind(this)
      },

      render() {
        return React.createElement(Wrapped, this.state)
      }
    })

    TestUtils.renderIntoDocument(React.createElement(Parent))

    expect(spy).toHaveBeenCalledTimes(1)
    parentSetState({childProp: 'foo'}, () => {
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

    let parentSetState = null
    const Parent = React.createClass({
      getInitialState() {
        return {childProp: 'foo'}
      },

      componentDidMount() {
        parentSetState = this.setState.bind(this)
      },

      render() {
        return React.createElement(Wrapped, this.state)
      }
    })

    TestUtils.renderIntoDocument(React.createElement(Parent))

    expect(spy).toHaveBeenCalledTimes(1)
    parentSetState({childProp: 'foo'}, () => {
      expect(spy).toHaveBeenCalledTimes(2)
      done()
    })
  })
})
