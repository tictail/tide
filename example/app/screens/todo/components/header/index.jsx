import React from 'react'
import TodoInput from './todo-input'

export default class extends React.Component {
  render() {
    return (
      <header className='header'>
        <h1>todos</h1>
        <TodoInput />
      </header>
    )
  }
}
