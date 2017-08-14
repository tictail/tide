import React from 'react'
import {wrap} from 'tide'

class ToggleAll extends React.Component {
  onChange = () => {
    this.props.tide.actions.todo.toggleAllCompleted()
  };

  render() {
    const all = this.props.todos.every((todo) => todo.get('completed'))
    return (
      <span>
        <input
          checked={all}
          onChange={this.onChange}
          className="toggle-all"
          id="toggle-all"
          type="checkbox"
        />
        <label htmlFor="toggle-all">
          Mark all as complete
        </label>
      </span>
    )
  }
}

export default wrap(ToggleAll, {todos: "todos"})
