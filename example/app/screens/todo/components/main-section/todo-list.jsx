import React from 'react'
import {wrap, Component as TideComponent} from 'tide'

import TodoItem from './todo-item'

const TodoList = React.createClass({
  renderTodos() {
    const {filter} = this.props
    return this.props.todos
      .filter((item) => filter === 'all' ||
                        (filter === 'active' && !item.get('completed')) ||
                        (filter === 'completed' && item.get('completed')))
      .map((item, index) => (
        // We don't pass down the todo item directly to the child component,
        // but instead wrap it with a TideComponent and specify the path to it
        // in the list. This makes it so that only that item needs to re-render
        // when it is changed, instead of every single one in the list.
        <TideComponent
          key={item.get('id')}
          todo={this.props.tide.keyPaths.todos.concat(item.get('id'))}
        >
          <TodoItem/>
        </TideComponent>
      ))
      .toArray()
  },

  render() {
    return (
      <ul className="todo-list">
        {this.renderTodos()}
      </ul>
    )
  }
})

export default wrap(TodoList, {
  todos: 'todos',
  filter: 'filter',
})
