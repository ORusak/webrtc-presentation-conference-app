import React from 'react'
import PropTypes from 'prop-types'

const Message = ({id, text, user, date}) => (
    <li>
        <span
            className="badge badge-primary"
            data-toggle="tooltip"
            data-placement="top"
            _id={id}
            title={`${user.name} (${user.id}) ${date}`}>{`${user.name}: ${text}`}</span>
    </li>
)

Message.propTypes = {
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['owner', 'visitor']),
    }),
    date: PropTypes.string.isRequire,
}

export default Message
