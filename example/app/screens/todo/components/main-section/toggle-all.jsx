import React from 'react'
import {wrap} from 'tictail-tide'

const ToggleAll = React.createClass({
  onChange() {
    this.props.tide.actions.todo.toggleAllCompleted()
  },

  render() {
    const all = this.props.todos.every((todo) => todo.get('completed'))
    return (
      <span>
        <input
          checked={all}
          onChange={this.onChange}
          className="toggle-all"
          type="checkbox"
        />
        <label htmlFor="toggle-all">
          Mark all as complete
        </label>
      </span>
    )
  }
})

export default wrap(ToggleAll, {todos: "todos"})
