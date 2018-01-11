/**
 * Компонент отображения видео потока.
 * Элементы управления используем от браузеров.
 */
import React from 'react'
import PropTypes from 'prop-types'
import isEmpty from 'lodash/isEmpty'

import Video from '../video'

import MediaService from '../../service/media'

const textConstrain = {
  'none': 'No media stream',
  'video': 'Video only',
  'audio': 'Audio only',
  'all': 'Video and audio',
}

class VideoInfo extends React.Component {
  
  render() {
    const { width, height, muted, controls, media, user } = this.props
    const typeMedia = MediaService.getTypeMedia(media)
    const {name, type} = user
    const userInfo = isEmpty(user) ? '' : `${name}(${type}). `

    return (
      <div className="col card border-danger">
        <div className="card-body">
        <h5 className="card-title">{userInfo}{textConstrain[typeMedia]}</h5>
          <Video
          height={height}
          width={width}
          muted={muted}
          controls={controls}
          autoPlay
          media={media}
        >Тег video не поддерживается вашим браузером</Video>
        </div>
      </div>
    )
  }
}

VideoInfo.defaultProps = {
  height: 200,
  width: 300,
  muted: true,
  controls: true,
  media: null,
  user: {}
}

VideoInfo.propTypes = {
  media: PropTypes.shape(
    {
      active: PropTypes.bool,
      ended: PropTypes.bool,
      id: PropTypes.string,
    }
  ),
  user: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.oneOf(['owner','visitor', null])
  }),
  height: PropTypes.number,
  width: PropTypes.number,
  muted: PropTypes.bool,
  controls: PropTypes.bool,
}

export default VideoInfo
