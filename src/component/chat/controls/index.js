import React from 'react'
import PropTypes from 'prop-types'

const CHAT_CONTEXT = '__chat-context__'
const Controls = () => (
    <div>
        <div className="input-group mb-3">
            <input
                type="text"
                className="form-control"
                placeholder="Text message"
                aria-label="Text message"/>
            <div className="input-group-append">
                <button className="btn btn-primary" type="button">Add</button>
            </div>
        </div>
    </div>
)

Controls.contextType = {
    [CHAT_CONTEXT]: PropTypes.object.isRequired,
}

export default Controls
