import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom'
import {Provider} from 'react-redux'
import 'webrtc-adapter/out/adapter'

import './App.css';

//  import ChooseRoom from './component/choose-room'
import RoomLogicContainer from './container/room-logic-container'

class App extends Component {

  render() {
    const {store} = this.props

    return (
      <Provider store={store}>
        <Router>
          <div className="h-100">
            {/*
              todo: add page user registration
              <Route exact path="/" component={ChooseRoom}/> {/* todo: add page room registration*/}
            <Route path="/" component={RoomLogicContainer}/>
          </div>
        </Router>
      </Provider>
    )
  }
}

export default App;
