import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

import configureStore from './store/configure-store'

const initialState = {
  "user": {
    "name": "Anonymous",
    "type": null
  },
  "room": {
    //  todo: убрать после реализации инициализации из адресной строки
    "id": '1232131'
  },
  "chat": {
    "messages": [],
    "editMessage": ""
  }
}
const store = configureStore(initialState)

ReactDOM.render(
  <App store={store} />,
  document.getElementById('root')
)

registerServiceWorker()
