import React from 'react'
import { TextField, RaisedButton, Dialog, FlatButton } from 'material-ui'
import socket from '../js/socket'
import { connect } from 'react-redux'
import store, { savedKeys, addPlayersAction, lobbyFullAction, removePlayerAction, startGameAction, gameInProgressAction, leftGameAction, joinedGameAction } from '../store/'
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

ClientLobby.socket.on('addPlayersToLobby', function (data) {
  store.dispatch(addPlayersAction(data))
})

ClientLobby.socket.on('removePlayerFromLobby', function (data) {
  store.dispatch(removePlayerAction(data))
})

ClientLobby.startGame = function () {
  ClientLobby.socket.emit('startGame')
}

ClientLobby.socket.on('gameHasStarted', function () {
  const state = store.getState()
  if (state.game.joined) {
    store.dispatch(startGameAction())
  }
})

ClientLobby.socket.on('lobbyFull', function () {
  store.dispatch(lobbyFullAction())
  store.dispatch(leftGameAction())
})

ClientLobby.socket.on('gameInProgress', function () {
  store.dispatch(gameInProgressAction())
})

class Lobby extends React.Component {
  constructor() {
    super()
    this.state = {
      open: false,
      inputFire: {fire: 'SPACEBAR'},
      inputSmash: {smash: 'Z'},
      inputPickup: {pickup: 'X'},
      inputLockOn: {lockOn: 'C'},
      name: ''
    }
    this.handleNameChange = this.handleNameChange.bind(this)
    this.lobbyFullComponent = this.lobbyFullComponent.bind(this)
    this.gameInProgressComponent = this.gameInProgressComponent.bind(this)
    this.gameJoinComponent = this.gameJoinComponent.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
    this.handleFireChange = this.handleFireChange.bind(this)
    this.handleSmashChange = this.handleSmashChange.bind(this)
    this.handlePickupChange = this.handlePickupChange.bind(this)
    this.handleLockOnChange = this.handleLockOnChange.bind(this)
    
  }

  startGameButton() {
    return (
      <div>
        <RaisedButton
          disabled={this.props.lobby.length < 2 || this.props.lobby.length > 4}
          label={this.props.lobby.length > 1 ? 'start game' : 'wait for players'}
          onClick={() => {
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
          label="join"
          onClick={() => {
            this.props.handleJoinLobby()
            ClientLobby.askNewPlayer(this.state.name)
          }} />
      </div>)
    } else {
      return (<div>
        <RaisedButton
          label="leave"
          onClick={() => {
            this.props.handleLeaveLobby()
            ClientLobby.removePlayerLobbyBJAD()
          }} />
      </div>)
    }
  }

  lobbyFullComponent() {
    return (<p>Lobby's full!</p>)
  }

  gameInProgressComponent() {
    return (<p>Game in progress!</p>)
  }

  gameJoinComponent() {
    return (<div id="inputdiv">
      <TextField
        disabled={this.props.joined}
        hintText="Hello."
        floatingLabelText="Name"
        onChange={(event) => { this.handleNameChange(event.target.value) }}
      />
      <div id="belowtextfield">
        <div id="buttonHolder">
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

    </div>)
  }


  handleNameChange(input) {
    this.setState({ name: input })
  }

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSmashChange = (e) => {
    let lowerCase = e.target.value
    console.log('change', lowerCase.toUpperCase())
    this.setState({
      inputSmash: lowerCase.toUpperCase()
    })
  };

  handleFireChange = (e) => {
    let lowerCase = e.target.value
    console.log('change', e.target.value)
    this.setState({
      inputFire: lowerCase.toUpperCase()
    })
  };

  handlePickupChange = (e) => {
    let lowerCase = e.target.value
    console.log('change', e.target.value)
    this.setState({
      inputPickup: lowerCase.toUpperCase()
    })
  };

  handleLockOnChange = (e) => {
    let lowerCase = e.target.value
    console.log('change', e.target.value)
    this.setState({
      inputLockOn: lowerCase.toUpperCase()
    })
  };

  //todo: make a create game button if there are no open created games on the server.
  //created games should have a timer.
  render() {
    //console.log("hi",this.state)

    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="Save"
        primary={true}
        keyboardFocused={true}
        onClick={() => {
          this.setState({ open: false })
          this.props.handleSubmit(this.state.inputFire, this.state.inputSmash, this.state.inputPickup, this.state.inputLockOn)
        }}
      />,
    ];

    if (!this.props.localGame) {
      return (
        <div id="lobbydiv">
          <div id="central">
            <div id="masthead">
              <h1>RESOURCE PALS</h1>
            </div>
            {!this.props.serverGame && !this.props.lobbyFull && this.gameJoinComponent()}
            {this.props.lobbyFull && this.lobbyFullComponent()}
            {this.props.serverGame && !this.props.joined && this.gameInProgressComponent()}
            {}
            <div id="controls">
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

              <div>
                <RaisedButton label="Options" onClick={this.handleOpen} />
                <Dialog
                  title="Options Menu"
                  actions={actions}
                  modal={false}
                  open={this.state.open}
                  onRequestClose={this.handleClose}
                >
                  Don't forget to save your options
          <br />
                  <form>
                    Change fire: <input onChange={this.handleFireChange} placeholder="SpaceBar"></input>
                    <br />
                    Change smash: <input onChange={this.handleSmashChange} placeholder="Z"></input>
                    <br />
                    Change pickup: <input onChange={this.handlePickupChange} placeholder="X"></input>
                    <br />
                    Change lockOn: <input onChange={this.handleLockOnChange} placeholder="C"></input>
                    <br />
                  </form>
                </Dialog>
              </div>
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
    } else {
      return (<div></div>)
    }
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
  handleSubmit(fire, smash, pickup, lockOn) {
    const keysObject = {fire, smash, pickup, lockOn}
    dispatch(savedKeys(keysObject))
   }
   })

const LobbyContainer = withRouter(connect(mapState, mapDispatch)(Lobby))
export default LobbyContainer
