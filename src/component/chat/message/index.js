import React from 'react'
import PropTypes from 'prop-types'
import {format} from 'date-fns'

const Message = ({ message }) => {
    const { id, text, user, date } = message
    //  todo: добавить проверку на формат даты
    const niceDate = format(new Date(date), 'MM.DD.YYYY mm:ss')
    const isOwnerMessage = user.type === 'owner'

    return (
    <li>
        <span
            className={`alert w-100 m-1 ${isOwnerMessage ? 'alert-primary float-left' : 'alert-success float-right'}`}
            data-toggle="tooltip"
            data-placement="top"
            _id={id}
            title={`${user.name} (${user.id}) - ${user.type}\nCreate: ${niceDate}`}>{`${user.name}: ${text}`}</span>
    </li>
    )
}

Message.propTypes = {
    message: PropTypes.shape({
        id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        user: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            type: PropTypes.oneOf(['owner', 'visitor']),
        }),
        date: PropTypes.string.isRequire,
    })
}

export default Message
