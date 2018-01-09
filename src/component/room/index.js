import React from 'react'
import PropTypes from 'prop-types'

import MessageListContainer from '../../container/message-list'
import ControlsContainer from '../../container/controls'
import Video from '../video'

const Room = (props) => (
  <div className="container h-100">
    <div className="row h-100">
      <div className="col h-100 p-1">
        <div className="row h-75">
          <div className="col h-100 card border-primary">
            <img
              src={`${process.env.PUBLIC_URL}/webrtc.jpg`}
              className="img-fluid"
              alt="Responsive"/>
          </div>
        </div>
        <div className="row h-25 pt-1">
          <div className="col card border-danger">
            <Video media={props.ownerMedia}>Тег video не поддерживается вашим браузером</Video>
          </div>
          <div className="col card border-danger">
            <Video media={props.visitorMedia}>Тег video не поддерживается вашим браузером</Video>
          </div>
        </div>
      </div>
      <div className="col-4 h-100 p-1">
        <div className="row h-75 ml-4">
          <MessageListContainer/>
        </div>
        <div className="row h-25 ml-4 pt-1">
          <ControlsContainer/>
        </div>
      </div>
    </div>
  </div>
)

Room.propTypes = {
  //  todo: подумать как задать тип для медиа
  ownerMedia: PropTypes.any,
  visitorMedia: PropTypes.any
}

export default Room
