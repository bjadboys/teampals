import React from 'react'
import { connect } from 'react-redux'
import store, { leftGameAction, changeNameAction, changeSpriteAction } from '../store/'


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

ClientLobby.startGame = function () {
    ClientLobby.socket.emit('startGame')
}

class Lobby extends React.Component {
    disableCheck() {
        if (this.props.playerName.length === 0 || this.props.playerSprite === 0) return true
        else return false
    }
    joinGameButton() {
        let disabled = this.disableCheck()
        if (!this.props.joined) {
            return (<div>
                <button
                    disabled={disabled}
                    onClick={() => {
                        ClientLobby.askNewPlayer({ name: this.props.playerName, spriteID: this.props.playerSprite })
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
    startGameButton() {
        return (
            <div>
                <button
                    onClick={() => {
                        ClientLobby.startGame()
                    }}
                > Start Game </button>
            </div>

        )
    }

    getTakenIDs(lobby) {
        let takenIdArr = []
        lobby.forEach(player => {
            takenIdArr.push(player.id)
        })
        return takenIdArr
    }

    freeSpriteIDs(takenIDs) {
        let spriteIDs = [1, 2, 3, 4]
        return spriteIDs.filter(spriteID => {
            return !takenIDs.includes(spriteID)
        })
    }

    buttonStyler(key, playerSprite) {
        if (key === playerSprite) return { backgroundColor: "blue" }
        // else return {backgroundColor: "white"}
    }

    joinedPlayerStyler(key, playerSprite) {
        if (key === playerSprite) return { border: "double" }
    }

    render() {
        const freeSpriteIDsArr = this.freeSpriteIDs(this.getTakenIDs(this.props.lobby))
        console.log(this.props.serverGame)
        return (
            <div className='containerLob'>
                <h1 className='headers'>
                    Resource Pals
                </h1>
                <h2 className='headers'>
                    Lobby!
                </h2>
                {!this.props.serverGame ?
                    <div>
                        {
                            this.props.lobby.length ?
                                <div className="playerHolder">
                                    <h3>Joined Players</h3>
                                    <div className="playerLobby">
                                        {this.props.lobby.map(player => (
                                            <div
                                                className="joinedPlayer"
                                                key={player.id}
                                                style={this.joinedPlayerStyler(player.id, this.props.playerSprite)}
                                            >
                                                Yo!<br />
                                                {player.id}<br />
                                                {player.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                : null
                        }
                        {freeSpriteIDsArr.length && !this.props.joined ?
                            <div className="characterHolder">
                                <h3>Available Characters</h3>
                                {/* Turn buttons into sprite images or GIFs */}
                                <div className="availableCharacters">
                                    {freeSpriteIDsArr.map(id => (<button
                                        style={this.buttonStyler(id, this.props.playerSprite)}
                                        disabled={this.props.joined}
                                        onClick={(event) => {
                                            this.props.handleSpriteChange(id)
                                        }}
                                        key={id}
                                    >
                                        {id}
                                    </button>))}
                                </div>
                            </div>
                            : null}
                        {!this.props.joined ?
                            <input className='inputField' type='text'
                                disabled={this.props.joined}
                                placeholder="Name"
                                maxLength="13"
                                value={this.props.playerName}
                                onChange={(event) => { this.props.handleNameChange(event.target.value) }}
                            />
                            : null}
                        <div className="lobbyActions">
                            {this.joinGameButton()}
                            {this.props.lobby.length > 1 ?
                                this.startGameButton()
                                : null}
                        </div>
                    </div>
                    : <div>Game in progress</div>}
            </div>)
    }
}

const mapState = (state) => ({
    lobby: state.lobby,
    joined: state.game.joined,
    playerName: state.player.name,
    serverGame: state.game.serverGame,
    playerSprite: state.player.sprite
})

const mapDispatch = (dispatch) => ({
    handleLeaveLobby() {
        dispatch(leftGameAction())
    },
    handleNameChange(input) {
        dispatch(changeNameAction(input))
    },
    handleSpriteChange(spriteID) {
        dispatch(changeSpriteAction(Number(spriteID)))
    }
})

export default connect(mapState, mapDispatch)(Lobby)