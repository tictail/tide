import React from 'react'

import Header from './components/header'
import MainSection from './components/main-section'
import Footer from './components/footer'

export default React.createClass({
  render() {
    return (
      <div className="todo-screen">
        <Header/>
        <MainSection/>
        <Footer/>
      </div>
    )
  }
})
