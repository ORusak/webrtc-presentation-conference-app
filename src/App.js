import React, {Component} from 'react';
import './App.css';

import Chat from './component/chat';

class App extends Component {
  render() {
    return (
      <div className="container h-100">
        <div className="row h-100">
          <div className="col h-100 p-1">
            <div className="row h-75">
              <div className="col h-100 card border-primary">
                <img
                  src="http://lorempicsum.com/rio/800/500/4"
                  className="img-fluid"
                  alt="Responsive"/>
              </div>
            </div>
            <div className="row h-25 pt-1">
              <div className="col card border-danger">
                Video
              </div>
            </div>
          </div>
          <div className="col-4 h-100 p-1">
            <Chat>
              <div className="row h-75 ml-4">
                <Chat.List/>
              </div>
              <div className="row h-25 ml-4 pt-1">
                <Chat.Controls/>
              </div>
            </Chat>
          </div>
        </div>
      </div>
    );
  }
}

export default App;