import React, {Component} from 'react'
import SideBar from './SideBar.jsx'
import {Switch, Route, BrowserRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import store, { getKeysAction, addPlayersAction, lobbyFullAction, removePlayerAction, startGameAction, gameInProgressAction, leftGameAction, joinedGameAction, changeSpriteAction} from '../store/'


import socket from '../js/socket'

import Lobby from './Lobby2.jsx'
import Tutorial from './Tutorial.jsx'
import Settings from './Settings.jsx'

const ClientLobby = {}
ClientLobby.socket = socket

// General Lobby actions
ClientLobby.socket.on('addPlayersToLobby', function(data){
  store.dispatch(addPlayersAction(data))
})

ClientLobby.socket.on('joinedGame', function(){
  store.dispatch(joinedGameAction())
})

ClientLobby.socket.on('failedJoin', function(){
  store.dispatch(changeSpriteAction(0))
})

ClientLobby.socket.on('removePlayerFromLobby', function(data){
  store.dispatch(removePlayerAction(data))
})

ClientLobby.socket.on('gameHasStarted', function(){
  const state = store.getState()
  if (state.game.joined) {
    store.dispatch(startGameAction())
  }
})

ClientLobby.socket.on('lobbyFull', function(){
  store.dispatch(lobbyFullAction())
  store.dispatch(leftGameAction())
})

ClientLobby.socket.on('gameInProgress', function(){
  store.dispatch(gameInProgressAction())
})

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

const mapState = (state) => ({
  lobby: state.lobby,
  localGame: state.game.localGame,
  serverGame: state.game.serverGame,
  joined: state.game.joined,
  lobbyFull: state.game.lobbyFull
})

const mapDispatch = (dispatch) => ({
  handleJoinLobby() {
    dispatch(joinedGameAction())
  },
  handleLeaveLobby() {
    dispatch(leftGameAction())
  },
  handleSubmit(keys) {
    dispatch(getKeysAction(keys))
  }
})

export default connect(mapState, mapDispatch)(Home)
