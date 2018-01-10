import React, {Component} from 'react'
import {withRouter, NavLink} from 'react-router-dom'

class SideBar extends Component {
  constructor(props) {
    super(props)
  }

  lobby() {
    return (
      <div className="navLobby">
        <NavLink
          className='lobbyLink' to="/lobby"
          >Lobby
        </NavLink>
      </div>
    )
  }

  tutorial(){
    return (
      <div className="navTutorial">
        <NavLink 
          className='tutorialLink' to="/tutorial"
          >Tutorial
        </NavLink>
      </div>
    )
  }

  settings(){
    return (
      <div className="navSettings">
        <NavLink 
          className='settingsLink' to="/settings"
          >Settings
        </NavLink>
      </div>
    )
  }

  render(){
    if (this.props.location.pathname === "/tutorial"){
      return (
        <div className="navContainer">
          {this.tutorial()}
          {this.lobby()}
          {this.settings()}
        </div>
      )
    }
    else if(this.props.location.pathname === "/settings"){
      return (
        <div className="navContainer">
          {this.settings()}
          {this.tutorial()}
          {this.lobby()}
        </div>
      )
    } else {
      return (
        <div className="navContainer">
          {this.lobby()}
          {this.settings()} 
          {this.tutorial()}
        </div>
      )
    }   
  }
}

export default withRouter(SideBar)