import React from 'react'
import PropTypes from 'prop-types'

const Controls = ({addMessage, editMessage, messageText, user}) => {
    const addMessageHandler = () => {

        addMessage(messageText, user)
        editMessage('')
    }
    
    const editMessageHandler = (event) => {
        const message = event.target.value

        editMessage(message)
    }

    return (
        <div>
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Text message"
                    aria-label="Text message"
                    value={messageText}
                    onChange={editMessageHandler}/>
                <div className="input-group-append">
                    <button className="btn btn-primary" type="button" onClick={addMessageHandler}>Add</button>
                </div>
            </div>
        </div>
    )
}

Controls.defaultProps = {
    messageText: ''
}

Controls.propTypes = {
    messageText: PropTypes.string,
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        type: PropTypes.oneOf(['owner', 'visitor'])
    }),
    editMessage: PropTypes.func.isRequired,
    addMessage: PropTypes.func.isRequired
}

export default Controls
