import React, {Component} from 'react'
import PropTypes from 'prop-types'

import MessageList from './message-list'
import Controls from './controls'

const list = [
    'Message 1',
    'Message 1',
    'Message 1',
    'Message 1',
    'Message 1',
]

const CHAT_CONTEXT = '__chat-context__'

class Chat extends Component {
    static List = MessageList
    static Controls = Controls

    static childContextTypes = {
        [CHAT_CONTEXT]: PropTypes.object.isRequired,
    }

    getChildContext () {

        return {
            [CHAT_CONTEXT]: {
                list
            }
        }
    }

    render () {
        const {className, ...props} = this.props
        
        return (
        <div className={`h-100 ${className}`}>
            {this.props.children}
        </div>)
    }
}

export default Chat
