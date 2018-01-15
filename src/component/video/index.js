/**
 * Компонент отображения видео потока.
 * Элементы управления используем от браузеров.
 */
import React from 'react'
import PropTypes from 'prop-types'

class Video extends React.Component {
  componentDidMount() {
    this.video.srcObject = this.props.media
  }

  shouldComponentUpdate(props) {
    return this.props.media !== props.media
  }

  componentDidUpdate() {
    this.video.srcObject = this.props.media
  }

  render() {
    const { width, height, muted, controls, children } = this.props

    return (
      <video
        height={height}
        width={width}
        muted={muted}
        controls={controls}
        autoPlay
        ref={(video) => { this.video = video }}
      >
        {children}
      </video>
    )
  }
}

Video.defaultProps = {
  children: null,
  height: '100%',
  width: '100%',
  muted: true,
  controls: true,
  media: null,
}

Video.propTypes = {
  children: PropTypes.node,
  media: PropTypes.shape(
    {
      active: PropTypes.bool,
      ended: PropTypes.bool,
      id: PropTypes.string,
    },
  ),
  height: PropTypes.string,
  width: PropTypes.string,
  muted: PropTypes.bool,
  controls: PropTypes.bool,
}

export default Video
