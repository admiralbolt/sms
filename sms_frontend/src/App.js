import React from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import Map from './components/Map/Map';

class App extends React.Component {

  constructor(props) {
    super(props);

    const today = new Date();
    const offset = today.getTimezoneOffset();
    const adjustedDate = new Date(today.getTime() - (offset*60*1000));
    const readableDate = adjustedDate.toISOString().split('T')[0];

    this.state = {
      date: today,
      readableDate: readableDate,
    };
  }
  

  updateDate(date) {
    this.setState({date: date});
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset*60*1000));
    this.setState({readableDate: adjustedDate.toISOString().split('T')[0]});
  }
  
  render() {
    return (
      <div id='app-wrapper' style={{ height: "100vh", width: "100vw" }}>
        <DatePicker portalId='app-wrapper' selected={this.state.date} onChange={(date) => this.updateDate(date)} />
        <Map date={this.state.readableDate} />
      </div>
    );
  }
}

export default App;
