import React from 'react'
import classNames from 'classnames'

class TodoItem extends React.Component {
  state = {
    editing: false,
    lastTitle: null,
  };

  onToggleCompleted = (e) => {
    this.props.tide.actions.todo.toggleCompleted(
      this.props.tide.keyPaths.todo
    )
  };

  onDestroy = () => {
    this.props.tide.actions.todo.destroy(
      this.props.tide.keyPaths.todo
    )
  };

  onChangeTitle = (e) => {
    this.props.tide.actions.todo.changeTitle(
      this.props.tide.keyPaths.todo,
      e.target.value
    )
  };

  onTitleKeyDown = (e) => {
    if (['Enter', 'Escape'].indexOf(e.key) !== - 1) {
      this.refs.titleInput.blur()
      if (e.key === 'Escape') {
        this.props.tide.actions.todo.changeTitle(
          this.props.tide.keyPaths.todo,
          this.state.lastTitle
        )
      }
    }
  };

  onTitleBlur = () => {
    this.setState({editing: false})
  };

  onStartEditing = () => {
    this.setState({
      editing: true,
      lastTitle: this.props.todo.get('title')
    }, () => {
      const node = this.refs.titleInput
      node.focus()
      node.setSelectionRange(node.value.length, node.value.length)
    })
  };

  render() {
    const {todo} = this.props
    return (
      <li
        className={classNames({
          completed: todo.get('completed'),
          editing: this.state.editing,
        })
      }>
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={todo.get('completed')}
            onChange={this.onToggleCompleted}
          />
          <label onDoubleClick={this.onStartEditing}>
            {todo.get('title')}
          </label>
          <button className="destroy" onClick={this.onDestroy}/>
        </div>
        <input
          className="edit"
          ref="titleInput"
          value={todo.get('title')}
          onChange={this.onChangeTitle}
          onBlur={this.onTitleBlur}
          onKeyDown={this.onTitleKeyDown}
        />
      </li>
    )
  }
}

export default TodoItem