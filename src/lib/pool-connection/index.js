/**
 * Библиотека поддержки множественных RTCPeerConnection
 * 
 * Продублируем нужное API RTCPeerConnection для начальной гибкости и простоты решения.
 * В дальнейшем можно упростить API вынеся во внутрь типовые операции.
 * 
 * Реализация подразумевает, что у всех соединений одинаковые обработчики. Если будут сценарии 
 * при которых требуются также индивидуальные нужно будет доработать.
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

        /**
         * @typedef Connection
         * 
         * @prop {object} peer соединение
         * @prop {object} channels список data соединений. где ключ label, значение - экземпляр
         * 
         */

        /**
         * @typedef Pool
         * 
         * Ассоциативный массив Connection. Где ключ - идентификатор соединения сокета собеседника.
         */
        this._pool = {}
    }

    add (id) {
        if (id) {
            const peer = RTCPeerConnection(configuration)

            this._pool[id] = { 
                peer,
                channels: {}
             }
            peer.ontrack = this._ontrack.bind(peer, id)
            peer.onicecandidate = this._onicecandidate.bind(peer, id)
            peer.ondatachannel = this._ondatachannel.bind(peer, id)

            return peer
        }

        throw new Error('[PoolPeerConnection.add] Expected connection id')
    }

    addTrack (id, track, localMedia) {
        if (id) {
            
            return this._pool[id].peer.addTrack(track, localMedia)
        }

        throw new Error('[PoolPeerConnection.addTrack] Expected connection id')
    }

    setRemoteDescription (id, desc) {
        if (id) {
            
            return this._pool[id].peer.setRemoteDescription(desc)
        }

        throw new Error('[PoolPeerConnection.setRemoteDescription] Expected connection id')
    }

    createAnswer(id) {
        if (id) {
            
            return this._pool[id].peer.createAnswer()
        }

        throw new Error('[PoolPeerConnection.createAnswer] Expected connection id')
    }
   
    setLocalDescription(id, desc) {
        if (id) {
            
            return this._pool[id].peer.setLocalDescription(desc)
        }

        throw new Error('[PoolPeerConnection.setLocalDescription] Expected connection id')
    }
    
    getLocalDescription(id) {
        if (id) {
            
            return this._pool[id].peer.localDescription
        }

        throw new Error('[PoolPeerConnection.getLocalDescription] Expected connection id')
    }
    
    addIceCandidate(id, candidate) {
        if (id) {
            
            return this._pool[id].peer.addIceCandidate(candidate)
        }

        throw new Error('[PoolPeerConnection.addIceCandidate] Expected connection id')
    }

    sendAll (label, data) {

        forEach(this._pool, (conn, id) => {
            const channel = conn.channels[label]

            if (channel) {
                channel.send(JSON.stringify(data))

                return null
            }

            throw new Error(`[PoolPeerConnection.sendAll] Peer [${id}]. Not found channel with label [${label}]`)
        })
    }

    set onicecandidate (callback) {
        this._onicecandidate = callback

        forEach(this._pool, (conn, id) => {

            conn.peer.onicecandidate = callback.bind(conn, id)
        })
    }

    set ontrack (callback) {
        this._ontrack = callback

        forEach(this._pool, (conn, id) => {

            conn.peer.ontrack = callback.bind(conn, id)
        })
    }

    set ondatachannel (callback) {
        //  общий обработчик должен сохранить ссылку на новый канал
        //  для использования в дальнейшем для рассылок сообщений
        this._ondatachannel = (id, event) => {
            const {channel} = event
            const {label} = channel

            this._pool[id].channels[label] = channel

            callback(id, event)
        }

        forEach(this._pool, (conn, id) => {

            conn.peer.ondatachannel = callback.bind(conn, id)
        })
    }
}

export default PoolPeerConnection
