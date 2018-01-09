import React, {Component} from 'react'
import {NavLink} from 'react-router-dom'

export default class SideBar extends Component {
  constructor() {
    super()
    this.state = {
      tutorial: true
    }
    this.handleClick = this.handleClick.bind(this)
    this.lobby = this.lobby.bind(this)
    this.tutorial = this.tutorial.bind(this)
  }

  lobby() {
    return (
      <div className="navLobby">
        <NavLink
          onClick={()=>{this.handleClick(false)}} 
          className='navs' to="/lobby">Lobby</NavLink>
      </div>
    )
  }

  handleClick(bool) {
    this.setState({tutorial: bool})
  }

  tutorial(){
    return (
      <div className="navTutorial">
        <NavLink onClick={() => {this.handleClick(true)}} className='navs' to="/tutorial">Tutorial</NavLink>
      </div>
    )
  }


  render(){
    return (
      <div className="navContainer">
        {this.state.tutorial ? this.tutorial() : this.lobby()}
        {this.state.tutorial ? this.lobby() : this.tutorial()}}
      </div>
    )
  }
}
