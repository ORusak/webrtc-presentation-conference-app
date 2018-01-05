import React from 'react'
import PropTypes from 'prop-types'
import {get} from 'lodash'

import './message-list.css'
import Message from '../message'

const CHAT_CONTEXT = '__chat-context__'
const MessageList = (props, context) => {
    const list = get(context, `[${CHAT_CONTEXT}].list`) || []

    return (
        <div className="card w-100">
            <ul>
                {list.map((message, i) => (<Message key={i} message={message}/>))}
            </ul>
        </div>
    )
}

MessageList.contextTypes = {
    [CHAT_CONTEXT]: PropTypes.object.isRequired
}

export default MessageList
