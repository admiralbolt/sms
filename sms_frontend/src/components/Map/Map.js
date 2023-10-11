import React from 'react';
import './Map.css';

import axios from "axios";

import { MapContainer, TileLayer, Marker, Popup, Tooltip, Circle } from 'react-leaflet'

const position = [47.65113, -122.3400]

class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      venues: [],
      shows: {}
    }
  }

  componentDidMount() {
    this.loadShows();
    this.loadVenues();
  }

  loadVenues() {
    axios.get("/api/venues").then((res) => {
      this.setState({ venues: res.data });
    });
  }

  loadShows() {
    // Shows should be indexed by venue. We do a two layer mapping of
    // venu -> date -> show object.
    axios.get("/api/events").then((res) => {
      const shows = {};
      res.data.forEach(show => {
        shows[show.venue] = shows[show.venue] || {};
        shows[show.venue][show.show_day] = show;
      });
      this.setState({ shows: shows });
    });
  }

  hasShow(venue, date) {
    if (this.state == undefined) return false;
    if (this.state.shows == undefined) return false;
    if (!(venue.id in this.state.shows)) return false;
    if (!(date in this.state.shows[venue.id])) return false;

    return true;
  }

  formatTime(t) {
    return new Date('1970-01-01T' + t + 'Z').toLocaleTimeString('en-US',
      {timeZone:'UTC', hour12:true, hour:'numeric', minute:'numeric'}
    );
  }

  render() {
    return (
      <MapContainer center={position} zoom={14} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {this.state.venues.map((venue) => (
          <Circle key={venue.id} center={[venue.latitude, venue.longitude]} pathOptions={{ fillColor: 'blue' }} radius={60}>
            <Tooltip>
              <h2 className='venue-name'>{venue.name}</h2>
              <hr />
              <p className='venue-address'>{venue.address}</p>
              <p className='venu-description'>"{venue.description}"</p>
              {this.hasShow(venue, this.props.date) &&
              <div>
                <hr />
                <b>SHOW TONIGHT!</b>
                <div class='show-info'>
                  <p className='show-title'>{this.state.shows[venue.id][this.props.date].title}</p>
                  <p className='show-time'>Music Starts at {this.formatTime(this.state.shows[venue.id][this.props.date].start_time)}</p>
                  <p className='show-price'>${this.state.shows[venue.id][this.props.date].ticket_price}</p>
                </div>
              </div>
              }
            </Tooltip>
          </Circle>
        ))}
      </MapContainer>
    );
  }
}

export default Map;
