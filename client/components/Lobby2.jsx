import React from 'react'
import {connect} from 'react-redux'
import store, {leftGameAction, joinedGameAction} from '../store/'


import socket from '../js/socket'


const ClientLobby = {}
ClientLobby.socket = socket

// Local Lobby specific actions
ClientLobby.askNewPlayer = function (name) {
    ClientLobby.socket.emit('newplayer', name); //will also need to send sprite id
}; 

ClientLobby.startGame = function () {
    ClientLobby.socket.emit('startGame')
}

ClientLobby.removePlayerLobbyBJAD = function () {
    ClientLobby.socket.emit('playerLeavesLobby')
}

class Lobby extends React.Component {
    constructor() {
        super()
        this.state = {
            name: ''
        }
        this.handleNameChange = this.handleNameChange.bind(this)
    }

    handleNameChange(input) {
        this.setState({name: input})
    }

    joinGameButton() {
        if (!this.props.joined) {
          return (<div>
                    <button
                    onClick={() => {
                      this.props.handleJoinLobby()
                      ClientLobby.askNewPlayer(this.state.name)
                    }} >Join</button>
                  </div>)
        } else {
          return (<div>
                    <button
                    onClick={() => {
                    this.props.handleLeaveLobby()
                    ClientLobby.removePlayerLobbyBJAD()
              }}> Leave</button>
                </div>)
        }
      }

    getTakenIDs(lobby){
        let takenIdArr = []
        lobby.forEach(player=>{
            takenIdArr.push(player.id)
        })
        console.log(takenIdArr)
        return takenIdArr
    }

    freeSpriteIDs(takenIDs) {
        let spriteIDs = [1, 2, 3, 4]
        return spriteIDs.filter(spriteID=> {
            return !takenIDs.includes(spriteID)
        })
    }

    render() {
        const freeSpriteIDsArr = this.freeSpriteIDs(this.getTakenIDs(this.props.lobby))
        console.log(freeSpriteIDsArr)
        return (
            <div className='containerLob'>
                <h1 className='headers'>
                    Resource Pals
                </h1>
                <h2 className='headers'>
                    Lobby!
                </h2>
                {freeSpriteIDsArr.length ? freeSpriteIDsArr.map(id=> (<div key={id}>{id}</div>)): <div>no free sprites</div>}
                <input className='inputField'type='text'
                    disabled={this.props.joined}
                    placeholder = "Name"
                    maxLength="13"
                    onChange={(event) => { this.handleNameChange(event.target.value) }}
                />
                {this.joinGameButton()}

            </div>)
    }
}

const mapState = (state) => ({
    lobby: state.lobby,
    joined: state.game.joined,
    lobbyFull: state.game.lobbyFull
})

const mapDispatch = (dispatch) => ({
    handleJoinLobby() {
        dispatch(joinedGameAction())
    },
    handleLeaveLobby() {
        dispatch(leftGameAction())
    }
})

  
export default connect(mapState,mapDispatch)(Lobby)