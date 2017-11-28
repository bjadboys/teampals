import React from 'react'
import {TextField, RaisedButton} from 'material-ui'
import Client from '../js/client'

export default class Lobby extends React.Component {
  constructor(){
    super()
    this.state = {
      name: '',
      joined: false,
      lobby: ['a', 'b']
    }
    this.handleNameChange = this.handleNameChange.bind(this)
  }

  startGameButton() {
    return (
      <div>
        <RaisedButton
            disabled={this.state.lobby.length < 2}
            label={this.state.lobby.length > 1 ? 'start game' : 'wait for players'}
            onClick={()=>{console.log('joined the game')}} //TODO: create socket connection. Add to lobby array.
            />
      </div>

    )
  }

  joinGameButton() {
    return (<div>
              <RaisedButton
              label={this.state.joined ? 'leave' : 'join'}
              onClick={() => {
                this.setState({joined: !this.state.joined})

              }} />
            </div>)
  }

  updateLobby(playerArray){
    this.setState({lobby: []})
  }

  handleNameChange(input) {
    this.setState({name: input})
  }

  render () {
    return (
    <div>
        <TextField
          hintText="Hello."
          floatingLabelText="Name"
          onChange={(event) => {this.handleNameChange(event.target.value)}}
        />
        <div id='buttonHolder'>
        {this.joinGameButton()}
        {this.state.joined && this.startGameButton()}
        </div>
        
    </div>
   )
  }

}
