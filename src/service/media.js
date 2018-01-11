/**
 * Сервис для обработки медиа данных
 */

 import isEmpty from 'lodash/isEmpty'

 //  ограничения получения локального медиа потока
const constraints = {
    video: {
        width: 360,
        height: 199
    },
    audio: true
}

const constraintsOnlyAudio = {
    video: false,
    audio: true
}

const MediaService = {
    /**
     * Перебираем какие устройства доступны
     * 
     * @requires {Promise.<MediaStream|null>} -
     */
    getUserMedia () {
        return navigator
            .mediaDevices
            .getUserMedia(constraints)
            .catch(error => {
                console.error('[RoomOwner.componentDidMount] getUserMedia video and audio', error)
            })
            .then(localMedia => {
                if (localMedia) {
                    return localMedia
                }

                return navigator
                .mediaDevices
                .getUserMedia(constraintsOnlyAudio)
            })
            .catch(error => {
                console.error('[RoomOwner.componentDidMount] getUserMedia only audio', error)
            })
            .then(localMedia => {
                if (localMedia) {
                    return localMedia
                }

                return {
                    localMedia: null,
                    typeMedia: 'none'
                }
            })
    },

    /**
     * 
     * @param {MediaStream} Media -
     * 
     * @returns {string} тип
     */
    getTypeMedia (media) {
        let type = 'none'

        if (media) {
            const isExistVideo = !isEmpty(media.getVideoTracks())
            const isExistAudio = !isEmpty(media.getAudioTracks())
    
            type = isExistVideo && isExistAudio 
                ? 'all' 
                : isExistAudio ? 'audio' : 'video'
        }

        return type
    }
}

export default MediaService
