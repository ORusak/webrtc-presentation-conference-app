import React from 'react'
import PropTypes from 'prop-types'

import './message-list.css'
import Message from '../message'

const MessageList = ({ list }) => (
    <ul className="card w-100">
        {list.map(message => (<Message key={message.id} message={message}/>))}
    </ul>
)

MessageList.defaultProps = {
    list: []
}

MessageList.propTypes = {
    list: PropTypes.array
}

export default MessageList
