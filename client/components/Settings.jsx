import React, {Component} from 'react'
import {connect} from 'react-redux'
import store, { getKeysAction } from '../store/'
import {uniq} from 'Ramda'

const uniqueValues = (arr) => {
    const uniqueVals = uniq(arr)
    return arr.length === uniqueVals.length
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
        if (!uniqueValues(Object.values(this.state))) {
            this.setState({disableSave: true})
            return (<div> No repeat keys!</div>)
        } else {
            this.setState({disableSave: false})
        }
    }

    render(){
    return (
            <div className='containerSet'>
                <h1 className='headers'>
                    Resource Pals 
                </h1>
                <h2 className='headers'>
                    Settings!
                </h2>
                {this.warning()}
                <div>
                    <form>
                        Change fire: <input onChange={this.handleFireChange} placeholder={this.state.fire === ' ' ? "SPACEBAR" : this.state.fire} />
                        <br />
                    Change smash: <input onChange={this.handleSmashChange} placeholder={this.state.smash === ' ' ? "SPACEBAR" : this.state.smash} />
                        <br />
                    Change pickup: <input onChange={this.handlePickupChange} placeholder={this.state.pickup === ' ' ? "SPACEBAR" : this.state.pickup} />
                        <br />
                    Change lockOn: <input onChange={this.handleLockOnChange} placeholder={this.state.lockOn === ' ' ? "SPACEBAR" : this.state.lockOn} />
                        <br />
                    </form>
                </div>
                <div>
                    <button
                    onClick={this.resetBindings}
                    >reset</button>
                    <button
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