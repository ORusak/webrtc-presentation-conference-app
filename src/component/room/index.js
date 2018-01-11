import React from 'react'
import PropTypes from 'prop-types'

import MessageListContainer from '../../container/message-list'
import ControlsContainer from '../../container/controls'
import VideoInfo from '../video-info'

const Room = ({ownerMedia, visitorMedia, owner, visitor}) => (
  <div className="container h-100">
    <div className="row h-100">
      <div className="col h-100 p-1">
        <div className="row h-75">
          <div className="col h-100 card border-primary">
            <img
              src={`${process.env.PUBLIC_URL}/webrtc.jpg`}
              className="img-fluid"
              alt="Responsive" />
          </div>
        </div>
        <div className="row h-25 pt-1">
          <VideoInfo media={ownerMedia} user={owner} />
          <VideoInfo media={visitorMedia} user={visitor}/>
        </div>
      </div>
      <div className="col-4 h-100 p-1">
        <div className="row h-75 ml-4">
          <MessageListContainer />
        </div>
        <div className="row h-25 ml-4 pt-1">
          <ControlsContainer />
        </div>
      </div>
    </div>
  </div>
)

const UserType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  type: PropTypes.oneOf(['owner','visitor', null])
})
const Media = PropTypes.shape({
  active: PropTypes.bool,
  ended: PropTypes.bool,
  id: PropTypes.string,
})
Room.propTypes = {
  //  todo: подумать как задать тип для медиа
  ownerMedia: Media,
  visitorMedia: Media,
  owner: UserType,
  visitor: UserType,
}

export default Room
