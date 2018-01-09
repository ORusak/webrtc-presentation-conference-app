/**
 * Библиотека поддержки множественных RTCPeerConnection
 * 
 * Продублируем нужное API RTCPeerConnection для начальной гибкости и простоты решения.
 * В дальнейшем можно упростить API вынеся во внутрь типовые операции.
 */

//  todo: вынести в настройки или в переменные окружения

import forEach from 'lodash/forEach'

const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.services.mozilla.org'
        }
    ]
}

//  todo: Добавить метод удаления соединения из пула
//  Например, при обрыве соединения
class PoolPeerConnection {

    constructor () {
        //  todo: изучить вариант заменить на WeekMap
        //  по идее если сборщик решил что соединение не нужно, то и нам оно уже не нужно
        this._pool = {}
    }

    add (id) {
        if (id) {
            this._pool[id] = RTCPeerConnection(configuration)
            this._pool[id].ontrack = this._ontrack.bind(this._pool[id], id)
            this._pool[id].onicecandidate = this._onicecandidate.bind(this._pool[id], id)

            return this._pool[id]
        }

        throw new Error('[PoolPeerConnection.add] Expected connection id')
    }

    addTrack (id, track, localMedia) {
        if (id) {
            
            return this._pool[id].addTrack(track, localMedia)
        }

        throw new Error('[PoolPeerConnection.addTrack] Expected connection id')
    }

    setRemoteDescription (id, desc) {
        if (id) {
            
            return this._pool[id].setRemoteDescription(desc)
        }

        throw new Error('[PoolPeerConnection.setRemoteDescription] Expected connection id')
    }

    createAnswer(id) {
        if (id) {
            
            return this._pool[id].createAnswer()
        }

        throw new Error('[PoolPeerConnection.createAnswer] Expected connection id')
    }
   
    setLocalDescription(id, desc) {
        if (id) {
            
            return this._pool[id].setLocalDescription(desc)
        }

        throw new Error('[PoolPeerConnection.setLocalDescription] Expected connection id')
    }
    
    getLocalDescription(id) {
        if (id) {
            
            return this._pool[id].localDescription
        }

        throw new Error('[PoolPeerConnection.getLocalDescription] Expected connection id')
    }
    
    addIceCandidate(id, candidate) {
        if (id) {
            
            return this._pool[id].addIceCandidate(candidate)
        }

        throw new Error('[PoolPeerConnection.addIceCandidate] Expected connection id')
    }

    set onicecandidate (callback) {
        this._onicecandidate = callback

        forEach(this._pool, (conn, id) => {

            conn.onicecandidate = callback.bind(conn, id)
        })
    }

    set ontrack (callback) {
        this._ontrack = callback

        forEach(this._pool, (conn, id) => {

            conn.ontrack = callback.bind(conn, id)
        })
    }
}

export default PoolPeerConnection
