import React from 'react'
import ReactDOM from 'react-dom'
import shortid from 'shortid'

import './index.css'
import App from './App'

import registerServiceWorker from './registerServiceWorker'

import configureStore from './store/configure-store'

const initialState = {
  "user": {
    "id": shortid.generate(),
    "name": "Anonymous",
    "type": null
  },
  "room": {
    //  todo: убрать после реализации инициализации из адресной строки
    "id": '1232131'
  },
  "chat": {
    "messages": [],
    "messageText": ""
  }
}
const store = configureStore(initialState)

ReactDOM.render(
  <App store={store} />,
  document.getElementById('root')
)

registerServiceWorker()
