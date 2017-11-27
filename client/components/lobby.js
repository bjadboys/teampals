import React from 'react'
import {TextField, RaisedButton} from 'material-ui'
import Client from ''

export default class Lobby extends React.Component {
  constructor(){
    super()
    this.state = {
      name: '',
      joined: false,
      lobby: []
    }
    this.handleNameChange = this.handleNameChange.bind(this)
  }



  startGameButton() {
    return (
      <div>
        <RaisedButton
            disabled={this.state.lobby.length < 2}
            label={this.state.lobby.length > 1 ? 'start game' : 'wait for players'}
            onClick={()=>{}}
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
    this.setState({lobby: playerArray})
  }

  handleNameChange(input) {
    this.setState({name: input})
  }

  render () {
    return (
    <div>
        <TextField
          hintText="Nothing offensive."
          floatingLabelText="Name"
          onChange={(event) => {this.handleNameChange(event.target.value)}}
        />
        {this.joinGameButton()}
    </div>
   )
  }

}
