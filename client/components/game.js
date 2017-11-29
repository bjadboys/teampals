import React from 'react'
import Game from '../game/'

class GameScreen extends React.Component {
  constructor(props){
    super(props)
  }

  render() {
    console.log('game rendered')
    return(
      <div id='gameDiv'>
      </div>
    )
  }
}

export default GameScreen
