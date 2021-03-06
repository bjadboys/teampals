import React from 'react'
import { connect } from 'react-redux'
import store, { leftGameAction, changeNameAction, changeSpriteAction, resetLobbyAction } from '../store/'


import socket from '../js/socket'

const higherOrderLobbyNotification = (bool) => (length) => {
    if(bool) {
        if(length < 2) {
            return (<div className="needSprite">Lonely? Get a friend in here!</div>)
        } else {
            return (<div className="spaceDiv" />)
        }
    } else {
        return (
        <div className="needSprite">Don't they look lonely? Get in there!</div>
        )
    }
}

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
                    className={!disabled ? 'joinGameButton' : 'disabledButton'}
                    disabled={disabled}
                    onClick={() => {
                        ClientLobby.askNewPlayer({ name: this.props.playerName, spriteID: this.props.playerSprite })
                    }} >Join</button>
            </div>)
        } else {
            return (
                <button
                    className='leaveGameButton'
                    onClick={() => {
                        if(this.props.lobby.length === 1) this.props.handleLobbyReset()
                        ClientLobby.removePlayerLobbyBJAD()
                        this.props.handleLeaveLobby()
                    }}> Leave</button>
            )
        }
    }
    startGameButton() {
        return (
            <button
                className='startGameButton'
                onClick={() => {
                    ClientLobby.startGame()
                }}
            > Start Game </button>
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
        if (key === playerSprite) return { border: '.7em solid  #84BCDA' }
        // else return {backgroundColor: "white"}
    }

    joinedPlayerStyler(key, playerSprite, joined) {
        if (key === playerSprite && joined) return { backgroundColor: '#A04EBF', border: '.7em solid  #A04EBF' }
        else return { border: '.7em solid #067BC2' }
    }

    render() {
        const freeSpriteIDsArr = this.freeSpriteIDs(this.getTakenIDs(this.props.lobby))
        return (
            <div className='containerLob'>
                <h1 className='headers'>
                    Resource Pals
                </h1>
                {!this.props.serverGame  ?
                    <div className="lobbySubContainer">
                        {
                            this.props.lobby.length ?
                                <div className="playerHolder">
                                    <h3 className='lobbyHeader'>Lobby</h3>
                                    <div className="playerLobby">
                                        {this.props.lobby.map(player => (
                                            <div
                                                className="joinedPlayer"
                                                key={player.id}
                                                style={this.joinedPlayerStyler(player.id, this.props.playerSprite, this.props.joined)}
                                            >
                                                <img className="lobbyImage" src={`../../assets/sprites/ButtonImg/${player.id}.png`} />
                                                {player.name}
                                            </div>
                                        ))}
                                    </div>
                                    {higherOrderLobbyNotification(this.props.joined)(this.props.lobby.length)}
                                </div>
                                : null
                        }
                        {freeSpriteIDsArr.length && !this.props.joined ?
                            <div className="characterHolder">
                                <h3 className='lobbyHeader'>Join Lobby</h3>
                                <div className="availableCharacters">
                                    {freeSpriteIDsArr.map(id => (<button
                                        className='spriteButton'
                                        style={this.buttonStyler(id, this.props.playerSprite)}
                                        disabled={this.props.joined}
                                        onClick={(event) => {
                                            this.props.handleSpriteChange(id)
                                        }}
                                        key={id}
                                    >
                                        <img className='spriteImage' src={`../../assets/sprites/ButtonImg/${id}.png`} />
                                    </button>))}
                                </div>
                                {this.props.playerSprite === 0 ? <div className="needSprite">Who will you be?!</div> : <div className="spaceDiv"></div>}
                                <div className='joinGameContainer'>
                                    <input className='inputField' type='text'
                                        disabled={this.props.joined}
                                        placeholder="Name"
                                        maxLength="9"
                                        value={this.props.playerName}
                                        onChange={(event) => { this.props.handleNameChange(event.target.value) }}
                                    />
                                    {this.joinGameButton()}
                                </div>
                                {this.props.playerName.length === 0 ? <div className="needName">What do we call you?!</div> : <div className="spaceDiv"></div>}
                            </div>
                            : null}
                        <div className="lobbyActions">
                            {this.props.lobby.length > 1 && this.props.joined ?
                                this.startGameButton()
                                : null}
                            {this.props.joined && this.joinGameButton()}
                        </div>
                    </div>
                    : <div>Game in progress</div>}
                <a className="githubLink" href="https://github.com/bjadboys/teampals"><i id="icon" className="fab fa-github-square" /></a>
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
    },
    handleLobbyReset(){
        dispatch(resetLobbyAction())
    }
})

export default connect(mapState, mapDispatch)(Lobby)