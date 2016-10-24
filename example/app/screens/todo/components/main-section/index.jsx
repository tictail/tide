import React from 'react'
import {wrap} from 'tide'

import ToggleAll from './toggle-all'
import TodoList from './todo-list'

const MainSection = React.createClass({
  render() {
    return this.props.todos.size > 0 ? (
      <section className="main">
        <ToggleAll/>
        <TodoList/>
      </section>
    ) : null
  }
})

export default wrap(MainSection, {todos: 'todos'})
