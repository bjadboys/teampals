import React, {Component} from 'react'
import SideBar from './SideBar.jsx'
import {Switch, Route, BrowserRouter} from 'react-router-dom'

import Lobby from './Lobby2.jsx'
import Tutorial from './Tutorial.jsx'
import Settings from './Settings.jsx'


class Home extends Component {

  render(){
    return(
      <div className="containerRow">
        <SideBar />
          <Switch>
            <Route exact path='/' component={Lobby} />
            <Route path='/lobby' component={Lobby} />
            <Route path='/tutorial' component={Tutorial} />
            <Route path='/settings' component={Settings} />
          </Switch>
      </div>

    )
  }

}

const HomeWrapper = () => {
  return (<BrowserRouter>
    <Home />
  </BrowserRouter>)
}

export default HomeWrapper
