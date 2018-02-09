import React, {Component} from 'react'
import {connect} from 'react-redux'
import store, { getKeysAction } from '../store/'
import {uniq} from 'ramda'

const uniqueValues = (arr) => {
    const uniqueVals = uniq(arr)
    return arr.length === uniqueVals.length
}

const validateKeys = (arr) => {
    return !uniqueValues(arr) || arr.includes('')
}

const getKeyCodes = (name) => {
    const oddCodes = { SHIFT: 16, SPACE: 32, TAB: 9, SPACEBAR: 32, RETURN: 13 }
    if (oddCodes[name]) return oddCodes[name]
    else return name.charCodeAt(0)
}

class Settings extends Component {
    constructor(props){
        super(props)
        this.state = {
            fire: String.fromCharCode(store.getState().keys.fire),
            smash: String.fromCharCode(store.getState().keys.smash),
            pickup: String.fromCharCode(store.getState().keys.pickup),
            lockOn: String.fromCharCode(store.getState().keys.lockOn)
        }
        this.resetBindings = this.resetBindings.bind(this)
    }

    handleSmashChange = (e) => {
        let lowerCase = e.target.value
        this.setState({
            smash: lowerCase.toUpperCase()
        })
    };

    resetBindings(){
        this.setState({ fire: 'SPACEBAR'})
        this.setState({ smash: 'Z'})
        this.setState({ pickup: 'X'})
        this.setState({ lockOn: 'C'})
    }

    handleFireChange = (e) => {
        let lowerCase = e.target.value
        this.setState({
            fire: lowerCase.toUpperCase()
        })
    };

    handlePickupChange = (e) => {
        let lowerCase = e.target.value
        this.setState({
            pickup: lowerCase.toUpperCase()
        })
    };

    handleLockOnChange = (e) => {
        let lowerCase = e.target.value

        this.setState({
            lockOn: lowerCase.toUpperCase()
        })
    };

    warning(){
        if (validateKeys(Object.values(this.state))) {
            return (<div className='warningContainer'><h1 className='warningHeader'>No repeat keys or empty inputs!</h1></div>)
        }
    }

    render(){
        const stateFire = String.fromCharCode(store.getState().keys.fire)
        const stateSmash = String.fromCharCode(store.getState().keys.smash)
        const statePickup = String.fromCharCode(store.getState().keys.pickup)
        const stateLockOn = String.fromCharCode(store.getState().keys.lockOn)
    return (
            <div className='containerSet'>
                <h1 className='headers'>
                    Resource Pals 
                </h1>
                <div className='displayControls'>
                    <h2 className='lobbyHeader'>Current Controls</h2>
                <div className='controlsRow'>
                <div>
                <p className='controlsP'>Fire: {stateFire === " " ? "SPACEBAR" : stateFire}</p>
                <p className='controlsP'>Smash Crate: {stateSmash === " " ? "SPACEBAR" : stateSmash}</p>
                </div>
                <div>
                <p className='controlsP'>Pick Up Crate: {statePickup === " " ? "SPACEBAR" : statePickup}</p>
                <p className='controlsP'>Target Lock: {stateLockOn === " " ? "SPACEBAR" : stateLockOn}</p>
                </div>
                </div>
                </div>
                <div>
                {this.warning()}
                    <form className='settingsContainer'>
                    <div className='inputHolder'>
                    Change fire: <input maxLength={1} value={this.state.fire === " " ? 'SPACEBAR' : this.state.fire} onChange={this.handleFireChange} placeholder={this.state.fire === " " ? "SPACEBAR" : this.state.fire} />
                        <br />
                        Change smash: <input maxLength={1} value={this.state.smash === " " ? 'SPACEBAR' : this.state.smash} onChange={this.handleSmashChange} placeholder={this.state.smash === " " ? "SPACEBAR" : this.state.smash} />
                    </div>
                    <div className='inputHolder'>
                        Change pickup: <input maxLength={1} value={this.state.pickup === " " ? 'SPACEBAR' : this.state.pickup} onChange={this.handlePickupChange} placeholder={this.state.pickup === " " ? "SPACEBAR" : this.state.pickup} />
                        <br />
                        Change lockOn: <input maxLength={1} value={this.state.lockOn === " " ? 'SPACEBAR' : this.state.lockOn} onChange={this.handleLockOnChange} placeholder={this.state.lockOn === " " ? "SPACEBAR" : this.state.lockOn} />
                    </div>
                    </form>
                </div>
                <div>
                    <button
                    className='settingsButton'
                    onClick={this.resetBindings}
                    >reset</button>
                    <button
                    className='settingsButton'
                    disabled={validateKeys(Object.values(this.state))}
                    onClick={()=> {
                        const keyBindings={fire: getKeyCodes(this.state.fire), smash: getKeyCodes(this.state.smash), pickup: getKeyCodes(this.state.pickup), lockOn: getKeyCodes(this.state.lockOn)}
                        this.props.handleSubmit(keyBindings)
                    }}
                    >save</button>
                </div>
            </div>)
    }
}

const mapDispatch = (dispatch) => ({
    handleSubmit(keys) {
        dispatch(getKeysAction(keys))
    }
})

const mapState = (state) => ({
    keys: state.keys
})

const SettingsContainer = connect(mapState, mapDispatch)(Settings)
export default SettingsContainer