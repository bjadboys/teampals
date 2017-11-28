import React from 'react'
import {TextField, RaisedButton} from 'material-ui'
import socket from '../js/socket'
import {connect} from 'react-redux'
import store, {addPlayersAction, removePlayerAction, startGameAction} from '../store/'
import { withRouter } from 'react-router-dom'
import GameScreen from './game'

const verbs = [' is ', ' fears only ', ' flights for ', ' runs toward ', ' spits at ', ' laughs at ']
const nouns = ['nothing!', 'danger!', 'handguns!', 'live tigers!', ' broken bones!', 'fancy blouses!']

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
  store.dispatch(startGameAction(true))
})

class Lobby extends React.Component {
  constructor(){
    super()
    this.state = {
      name: '',
      joined: false
    }
    this.handleNameChange = this.handleNameChange.bind(this)
  } 

  startGameButton() {
    return (
      <div>
        <RaisedButton
            disabled={this.props.lobby.length < 2}
            label={this.props.lobby.length > 1 ? 'start game' : 'wait for players'}
            onClick={()=> {
              ClientLobby.startGame()
            }} //TODO: create socket connection. Add to lobby array.
            />
      </div>

    )
  }

  joinGameButton() {
    if(!this.state.joined) {
      return (<div>
                <RaisedButton
                label='join'
                onClick={() => {
                  this.setState({joined: !this.state.joined})
                  ClientLobby.askNewPlayer(this.state.name)
                }} />
              </div>)
    } else {
      return (<div>
                <RaisedButton
                label='leave'
                onClick={() => {
                this.setState({ joined: !this.state.joined })
                ClientLobby.removePlayerLobbyBJAD()
          }} />
            </div>)
    }
  }
  

  handleNameChange(input) {
    this.setState({name: input})
  }

  render () {
    if (!this.props.game) {
      return (
      <div>
          <TextField
            disabled={this.state.joined}
            hintText="Hello."
            floatingLabelText="Name"
            onChange={(event) => {this.handleNameChange(event.target.value)}}
          />
          <div id='belowtextfield'>
          <div id='buttonHolder'>
          {this.joinGameButton()}
          {this.state.joined && this.startGameButton()}
          </div>
          <div>
              <ul>
                {this.props.lobby.length && this.props.lobby.map(player => {
                    return <li key={player.id}>{player.name}{verbs[Math.floor(Math.random() * verbs.length)]}{nouns[Math.floor(Math.random() * nouns.length)]}</li>
                })}
              </ul>
          </div>
          </div>
          
      </div>
     )
    } else {
      return (
        <GameScreen />
      )
    }
  }

}

const mapState = (state) => ({
  lobby: state.lobby,
  game: state.game
})

const mapDispatch = (dispatch) => ({
  handleJoinLobby(id) {
    dispatch(addPlayersAction(id))
  },
  handleLeaveLobby(id) {
    dispatch(removePlayerAction(id))
  }
})


const LobbyContainer = withRouter(connect(mapState, mapDispatch)(Lobby))
export default LobbyContainer
