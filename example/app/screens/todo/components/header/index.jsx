import React from 'react'
import TodoInput from './todo-input'

class Header extends React.Component {
  render() {
    return (
      <header className='header'>
        <h1>todos</h1>
        <TodoInput />
      </header>
    )
  }
}

export default Header