import React, { useEffect, useState } from 'react';
import './Map.css';

import axios from 'axios';

import { useMap, useMapEvents, MapContainer, TileLayer, Marker, Popup, Tooltip, Circle } from 'react-leaflet'

const SHOW_COLOR = '#0070ff';
const OPEN_MIC_COLOR = '#ee6600';
const NO_EVENT_COLOR = '#989898';

const defaultZoom = 13;

const CIRCLE_SIZES = [
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 90,  90,  90,  60,  37,  25,  20,  20]

const Map = (props) => {
  let date = props.date;
  const [venues, setVenues] = useState([]);
  const [events, setEvents] = useState({});
  const [circleSize, setCircleSize] = useState(CIRCLE_SIZES[defaultZoom]);

  useEffect(() => {
    loadVenues();
    loadShows();
  }, []);

  const mapEvents = useMapEvents({
    zoomend: () => {
      setCircleSize(CIRCLE_SIZES[mapEvents.getZoom()]);
    },
  });

  const loadVenues = () => {
    axios.get("/api/venues").then((res) => {
      setVenues(res.data);
    });
  }

  const loadShows = () => {
    // Shows should be indexed by venue. We do a two layer mapping of
    // venu -> date -> show object.
    axios.get("/api/events").then((res) => {
      const events = {};
      res.data.forEach(event => {
        events[event.venue] = events[event.venue] || {};
        events[event.venue][event.event_day] = event;
      });
      setEvents(events);
    });
  }

  const hasShow = (events, venue, date) => {
    if (!(venue.id in events)) return false;
    if (!(date in events[venue.id])) return false;

    return true;
  }

  const formatTime = (t) => {
    return new Date('1970-01-01T' + t + 'Z').toLocaleTimeString('en-US',
      {timeZone:'UTC', hour12:true, hour:'numeric', minute:'numeric'}
    );
  }

  const getTicketPrice = (event) => {
    if (event.ticket_price_min == event.ticket_price_max)
      return `$${event.ticket_price_min}`

    return `$${event.ticket_price_min} - $${event.ticket_price_max}`
  }

  
  return (
    <div>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {venues.map((venue) => (
        <Circle
          key={venue.id}
          center={[venue.latitude, venue.longitude]}
          pathOptions={{
            color: (hasShow(events, venue, props.date) ? (events[venue.id][props.date].event_type == 'Open Mic' ? OPEN_MIC_COLOR : SHOW_COLOR) : NO_EVENT_COLOR),
            fillColor: (hasShow(events, venue, props.date) ? (events[venue.id][props.date].event_type == 'Open Mic' ? OPEN_MIC_COLOR : SHOW_COLOR) : NO_EVENT_COLOR),
          }}
          radius={circleSize}
        >
          <Tooltip>
            <h2 className='venue-name'>{venue.name}</h2>
            <hr />
            <p className='venue-address'>{venue.address}</p>
            <p className='venu-description'>"{venue.description}"</p>
            {hasShow(events, venue, props.date) &&
            <div>
              <hr />
              <b>SHOW TONIGHT!</b>
              <div className='show-info'>
                <p className='show-title'>{events[venue.id][props.date].title}</p>
                <p className='show-time'>Music Starts at {formatTime(events[venue.id][props.date].start_time)}</p>
                <p className='show-price'>{getTicketPrice(events[venue.id][props.date])}</p>
                <p className='show-price'>{events[venue.id][props.date].ticket_price}</p>
              </div>
            </div>
            }
          </Tooltip>
        </Circle>
      ))}
    </div>
  );
}

export default Map;
