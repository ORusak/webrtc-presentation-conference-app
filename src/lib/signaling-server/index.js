/**
 * Интерфейс для работы с сигнальным сервером
 * - разделяем сообщения sdp и ice для выделения отдельного слоя
 * логики обработки
 *
 */

import io from 'socket.io-client'

//  список генерируемых событий обрабатываемых сервером
const allowEventType = [
    'init',
    'sdp',
    'ice'
]

class SignalingServer {

    /**
     * @constructor
     * 
     * @param {object} options -
     * @param {string} options.url -
     * @param {string} options.room -
     * 
     */
    constructor(options) {
        //  todo: заменить ссылку на сигнальный сервер на настройку
        //  связанный сокет пользователя-участника
        this._socket = io(options.url)

        //  для автоматического подмешивания в данные обмена
        this._room = options.room
    }

    /**
     * 
     * @param {string} type тип события
     * @param {object} [payload={}] полезная нагрузка
     */
    send (type, payload={}) {
        if (allowEventType.includes(type)) {
            const fullData = Object.assign({}, payload, { room: this._room })

            this._socket.emit(type, fullData)

            return null
        }
        
        throw new Error(`Wrong type signal: [${type}]`)
    }

    set oninit (callback) {
        this._initCallback = callback

        this._socket.on('init', callback)
    }

    get oninit () {
        
        return this._initCallback
    }

    set onsdp (callback) {
        this._sdpCallback = callback

        this._socket.on('sdp', callback)
    }

    get onsdp () {
        
        return this._sdpCallback
    }

    set onice (callback) {
        this._iceCallback = callback

        this._socket.on('ice', callback)
    }

    get onice () {
        
        return this._iceCallback
    }

    set onerror (callback) {
        this._errorCallback = callback

        this._socket.on('error', errorFactory('general', callback))
        this._socket.on('reconnect_error', errorFactory('reconnect', callback))
        this._socket.on('connect_error', errorFactory('connect', callback))
    }

    get onerror () {
        
        return this._errorCallback
    }
}

function errorFactory (type, callback) {

    return function errorHandler (error) {

        return callback({
            type,
            error
        }) 
    }
}

export default SignalingServer
