/* eslint-disable react/no-multi-comp */
import React from 'react'
import Sinon from 'sinon'
import Immutable from 'immutable'
import assign from 'lodash.assign'
import TestUtils from 'react-addons-test-utils'

import Tide from 'base'
import wrap from 'wrap'

describe('wrap', function() {
  beforeEach(function() {
    this.tideInstance = new Tide()
  })

  const createWrappedComponent = function(tideInstance, renderSpy, tideProps = {}) {
    const Child = React.createClass({
      render() {
        renderSpy && renderSpy.call(this)
        return null
      }
    })

    return wrap(Child, assign({tide: tideInstance}, tideProps))
  }

  it('wraps the given component class with a tide component', function() {
    const spy = Sinon.spy()

    const Wrapped = createWrappedComponent(this.tideInstance, function() {
      return spy(this.props.tide)
    })

    TestUtils.renderIntoDocument(React.createElement(Wrapped))
    return spy.firstCall.args[0].should.exist
  })

  it('passes the given props to the tide component', function() {
    this.tideInstance.setState(Immutable.Map({foo: 'bar'}))
    const spy = Sinon.spy()

    const Wrapped = createWrappedComponent(this.tideInstance, function() {
      return spy(this.props.stateProp)
    }
    , {stateProp: 'foo'})

    TestUtils.renderIntoDocument(React.createElement(Wrapped))
    return spy.firstCall.args[0].should.equal('bar')
  })

  it('passes props given to the wrap component to the child', function() {
    const spy = Sinon.spy()

    const Wrapped = createWrappedComponent(this.tideInstance, function() {
      return spy(this.props.childProp)
    })

    TestUtils.renderIntoDocument(React.createElement(Wrapped, {childProp: 'foo'}))
    return spy.firstCall.args[0].should.equal('foo')
  })

  it('re-renders the child when given new props', function() {
    const spy = Sinon.spy()

    const Wrapped = createWrappedComponent(this.tideInstance, function() {
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

    spy.should.have.been.calledWith('foo')
    parentSetState({childProp: 'bar'})
    return spy.should.have.been.calledWith('bar')
  })

  it('does not re-render the child when given the same props', function() {
    const spy = Sinon.spy()

    const Wrapped = createWrappedComponent(this.tideInstance, function() {
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

    return (() => spy.callCount).should.not.increase.when(() => parentSetState({childProp: 'foo'}))
  })

  return it('always re-renders when impure is true', function() {
    const spy = Sinon.spy()

    const Wrapped = createWrappedComponent(this.tideInstance, function() {
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

    return (() => spy.callCount).should.increase.when(() => parentSetState({childProp: 'foo'}))
  })
})
