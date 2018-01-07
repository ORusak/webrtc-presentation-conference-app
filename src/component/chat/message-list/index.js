import React from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'

import './message-list.css'
import Message from '../message'

const CHAT_CONTEXT = '__chat-context__'
const MessageList = (props, context) => {
    const list = get(context, `[${CHAT_CONTEXT}].list`) || []

    return (
        <ul className="card w-100">
            {list.map((message, i) => (<Message key={i} message={message}/>))}
        </ul>
    )
}

MessageList.contextTypes = {
    [CHAT_CONTEXT]: PropTypes.object.isRequired
}

export default MessageList
