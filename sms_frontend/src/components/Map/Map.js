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
    this.loadVenues();
    this.loadShows();
  }

  loadVenues() {
    axios.get("/api/venues").then((res) => {
      this.setState({ venues: res.data });
    });
  }

  loadShows() {
    // Shows should be indexed by venue. We do a two layer mapping of
    // venu -> date -> show object.
    axios.get("/api/shows").then((res) => {
      const shows = {};
      res.data.forEach(show => {
        shows[show.venue] = shows[show.venue] || {};
        shows[show.venue][show.show_day] = show;
      });
      this.setState({ shows: shows });
    });
  }

  render() {
    return (
      <MapContainer center={position} zoom={14} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {this.state.venues.map((venue) => (
          <Circle key={venue.id} center={[venue.latitude, venue.longitude]} pathOptions={{ fillColor: 'blue' }} radius={80}>
            <Tooltip>{venue.name}</Tooltip>
          </Circle>
        ))}
      </MapContainer>
    );
  }
}

export default Map;
