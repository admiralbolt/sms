import React, { useState } from 'react';
import './MapData.css';

import { useMap, useMapEvents, MapContainer, TileLayer, Marker, Popup, Tooltip, Circle } from 'react-leaflet'

import { useFilteredEventsByVenue, useFilteredVenues } from '../../hooks/filteredData';

import { useIsMobile } from '../../hooks/window';

import { Box, Typography } from '@mui/material';

const SHOW_COLOR = '#0070ff';
const OPEN_MIC_COLOR = '#ee6600';
const NO_EVENT_COLOR = '#989898';

const defaultZoom = 13;

const CIRCLE_SIZES = [
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 80,  80,  80,  60,  37,  25,  20,  20]

const Map = ({ setBannerOpen, setSelectedEvent, setSelectedVenue }) => {
  const filteredVenues = useFilteredVenues();
  const filteredEventsByVenue = useFilteredEventsByVenue();
  const isMobile = useIsMobile();
  const [circleSize, setCircleSize] = useState(CIRCLE_SIZES[defaultZoom]);

  const mapEvents = useMapEvents({
    zoomend: () => {
      setCircleSize(CIRCLE_SIZES[mapEvents.getZoom()]);
    },
    click: () => {
      setBannerOpen(false);
      setSelectedVenue({});
      setSelectedEvent({});
    }
  });

  const handleEventClick = (e, venue, event) => {
    e.originalEvent.view.L.DomEvent.stopPropagation(e);
    setSelectedVenue(venue);
    setSelectedEvent(event);
    setBannerOpen(true);
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

  const renderVenue = (venue) => {
    if (!(venue.id in filteredEventsByVenue))
      return '';

    const event = filteredEventsByVenue[venue.id];

    return (
      <Circle
        key={venue.id}
        center={[venue.latitude, venue.longitude]}
        pathOptions={{
          color: event.event_type == 'Open Mic' ? OPEN_MIC_COLOR : SHOW_COLOR,
          fillColor: event.event_type == 'Open Mic' ? OPEN_MIC_COLOR : SHOW_COLOR,
        }}
        
        eventHandlers={{ click: (e) => handleEventClick(e, venue, event)}}
        radius={circleSize}
      >
        {!isMobile &&
          <Tooltip>
            <Box>
              <Typography>{venue.name}</Typography>
            </Box>
          </Tooltip>
        }
      </Circle>
    );
  }

  
  return (
    <div>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {Object.values(filteredVenues).map((venue) => (
          renderVenue(venue)
      ))}
    </div>
  );
}

export default Map;
