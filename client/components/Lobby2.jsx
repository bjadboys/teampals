import React from 'react'
import {connect} from 'react-redux'

import socket from '../js/socket'

const ClientLobby = {}
ClientLobby.socket = socket

// Local Lobby specific actions
ClientLobby.askNewPlayer = function (name) {
    ClientLobby.socket.emit('newplayer', name);
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
            name: '',
            open: false,
            inputFire: 'SPACEBAR',
            inputSmash: 'Z',
            inputPickup: 'X',
            inputLockOn: 'C'
        }
        this.handleNameChange = this.handleNameChange.bind(this)
    }

    handleNameChange(input) {
        this.setState({name: input})
    }

    render() {
        console.log("here")
        return (
            <div className='containerLob'>
                <h1 className='headers'>
                    Resource Pals
                </h1>
                <h2 className='headers'>
                    Lobby!
                </h2>
                <input className='inputField'type='text'
                    // disabled={this.props.joined}
                    placeholder = "Name"
                    onChange={(event) => { this.handleNameChange(event.target.value) }}
                />
            </div>)
    }
}

export default connect()(Lobby)