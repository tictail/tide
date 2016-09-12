import React from 'react'
import {wrap} from 'tictail-tide'

const TodoInput = React.createClass({
  onChange(e) {
    // We can access all the registered actions through the `this.props.tide.actions' object.
    this.props.tide.actions.todo.setTodoInputText(e.target.value)
  },

  onKeyPress(e) {
    if (e.key === 'Enter') {
      this.props.tide.actions.todo.addTodo()
    }
  },

  render() {
    return (
      <input
        className="new-todo"
        value={this.props.value}
        onChange={this.onChange}
        onKeyPress={this.onKeyPress}
        placeholder={'What needs to be done?'}
        autoFocus
      />
    )
  }
})

// The `wrap` function wraps this component in a TideComponent, which gives us access to
// our actions and values from the global state. Here we set the "todoInputText"
// value from the state into `this.props.value'. Whenever this changes the component
// will re-render with the new value.
export default wrap(TodoInput, {value: 'todoInputText'})
