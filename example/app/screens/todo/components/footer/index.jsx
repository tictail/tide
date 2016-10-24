import React from 'react'
import {Link} from 'react-router'
import {wrap} from 'tide'
import classNames from 'classnames'

const FILTERS = [
  {key: 'all', route: '/', message: 'All'},
  {key: 'active', route: '/active', message: 'Active'},
  {key: 'completed', route: '/completed', message: 'Completed'},
]

const Footer = React.createClass({
  onClearCompleted() {
    return this.props.tide.actions.todo.clearCompleted()
  },

  renderFilters() {
    return FILTERS.map((filter) => (
      <li key={filter.key}>
        <Link
          to={filter.route}
          activeClassName="selected"
        >
          {filter.message}
        </Link>
      </li>
    ))
  },

  render() {
    const {todos} = this.props
    if (!todos || todos.size === 0) {
      return null
    }

    const completed = todos.filter((todo) => todo.get('completed'))
    const remaining = todos.size - completed.size

    return (
      <footer className='footer'>
        <span className='todo-count'>
          {`${remaining} item${remaining > 1 ? 's' : ''} left`}
        </span>
        <ul className="filters">
          {this.renderFilters()}
        </ul>
        {completed.size > 0 ?
          <button
            className="clear-completed"
            onClick={this.onClearCompleted}
          >
            Clear completed
          </button>
        : null}
      </footer>
    )
  }
})

export default wrap(Footer, {
  todos: 'todos',
  filter: 'filter',
})
