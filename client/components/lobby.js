import React from 'react'
import {TextField, RaisedButton} from 'material-ui'
import socket from '../js/socket'
import {connect} from 'react-redux'
import store, {addPlayersAction, removePlayerAction, startGameAction, gameInProgressAction, leftGameAction, joinedGameAction} from '../store/'
import { withRouter } from 'react-router-dom'
import GameScreen from './game'

const verbs = [' is ', ' fears only ', ' flights for ', ' runs toward ', ' spits at ', ' laughs at ']
const nouns = ['nothing!', 'danger!', 'handguns!', 'live tigers!', ' broken bones!', 'fancy blouses!']
const gameVerb = () => verbs[Math.floor(Math.random() * verbs.length)] 
const gameNoun = () => nouns[Math.floor(Math.random() * nouns.length)]

const ClientLobby = {}
ClientLobby.socket = socket

ClientLobby.removePlayerLobbyBJAD = function () {
  ClientLobby.socket.emit('playerLeavesLobby')
}

ClientLobby.askNewPlayer = function (name) {
  ClientLobby.socket.emit('newplayer', name);
};

ClientLobby.socket.on('addPlayersToLobby', function(data){
  store.dispatch(addPlayersAction(data))
})

ClientLobby.socket.on('removePlayerFromLobby', function(data){
  store.dispatch(removePlayerAction(data))
})

ClientLobby.startGame = function() {
  ClientLobby.socket.emit('startGame')
}

ClientLobby.socket.on('gameHasStarted', function(){
  const state = store.getState()
  if (state.game.joined) {
    store.dispatch(startGameAction())
  }
})

ClientLobby.socket.on('gameInProgress', function(){
  store.dispatch(gameInProgressAction())
})

class Lobby extends React.Component {
  constructor(){
    super()
    this.state = {
      name: ''
    }
    this.handleNameChange = this.handleNameChange.bind(this)
  } 

  startGameButton() {
    return (
      <div>
        <RaisedButton
            disabled={this.props.lobby.length < 2 || this.props.lobby.length > 4}
            label={this.props.lobby.length > 1 ? 'start game' : 'wait for players'}
            onClick={()=> {
              ClientLobby.startGame()
            }} //TODO: create socket connection. Add to lobby array.
            />
      </div>

    )
  }

  joinGameButton() {
    if (!this.props.joined) {
      return (<div>
                <RaisedButton
                label='join'
                onClick={() => {
                  this.props.handleJoinLobby()
                  ClientLobby.askNewPlayer(this.state.name)
                }} />
              </div>)
    } else {
      return (<div>
                <RaisedButton
                label='leave'
                onClick={() => {
                this.props.handleLeaveLobby()
                ClientLobby.removePlayerLobbyBJAD()
          }} />
            </div>)
    }
  }
  

  handleNameChange(input) {
    this.setState({name: input})
  }

  render () {
    if (!this.props.localGame && !this.props.serverGame) {
      return (
      <div id='lobbydiv'>
      <div id='central'>
      <div id='masthead'>
        <h1>RESOURCE PALS</h1>
      </div>
      <div id='inputdiv'>
          <TextField
            disabled={this.props.joined}
            hintText="Hello."
            floatingLabelText="Name"
            onChange={(event) => {this.handleNameChange(event.target.value)}}
          />
          <div id='belowtextfield'>
          <div id='buttonHolder'>
          {this.joinGameButton()}
          {this.props.joined && this.startGameButton()}
          </div>
          <div>
              <ul>
                {this.props.lobby.length && this.props.lobby.map(player => {
                      return <li key={player.id}>{player.name}{gameVerb()}{gameNoun()}</li>
                })}
              </ul>
          </div>
          </div>
          
      </div>
      <div id='controls'>
      <h2>How to Play</h2>
      <p>Break crates open for health and ammo!</p>
      <p>Drop crates in your base to level your pal!</p>
      <p>Shoot other Pals before they shoot you!</p>
      <p>Last Pal Standing Wins!</p>
      <h2>Controls</h2>
      <p>Move with arrow keys!</p>
      <p>Use Z to break open crates!</p>
      <p>Use X to pick up and drop crates!</p>
      <p>USE C to lock onto nearby target!</p>
      <p>Use SPACEBAR to fire!</p>
      </div>
      </div>
      </div>
     )
    } else if (this.props.joined && this.props.localGame && this.props.serverGame) {
      return (
        <div>
          <GameScreen />
        </div>
      )
    } else if (this.props.serverGame && !this.props.joined) {
      return (
        <p>Game in progress. Please wait.</p>
      )
    } else {
      return (<div></div>)
    }
  }

}

const mapState = (state) => ({
  lobby: state.lobby,
  localGame: state.game.localGame,
  serverGame: state.game.serverGame,
  joined: state.game.joined
})

const mapDispatch = (dispatch) => ({
  handleJoinLobby() {
    dispatch(joinedGameAction())
  },
  handleLeaveLobby() {
    dispatch(leftGameAction())
  }
})


const LobbyContainer = withRouter(connect(mapState, mapDispatch)(Lobby))
export default LobbyContainer
