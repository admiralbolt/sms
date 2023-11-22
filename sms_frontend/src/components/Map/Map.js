import React, { useEffect, useState } from 'react';
import './Map.css';

import MapData from './MapData.js';
import { useIsMobile, useWindowDimensions } from '../../hooks/window';
import { useAppBarHeight, useFilterPanelWidth } from '../../hooks/materialHacks';

import { useMap, useMapEvents, MapContainer, TileLayer, Marker, Popup, Tooltip, Circle } from 'react-leaflet'

import { Box, Button, Fade, Paper, Stack, Typography } from '@mui/material';
import EventDetail from '../EventList/EventDetail.js';

const zoom = 13;

const Map = () => {
  const { height, width } = useWindowDimensions();
  const isMobile = useIsMobile();
  const appBarHeight = useAppBarHeight();
  const filterPanelWidth = useFilterPanelWidth();

  const [mapPosition, setMapPosition] = useState([47.65113, -122.3400]);
  const [bannerOpen, setBannerOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState({});
  const [selectedVenue, setSelectedVenue] = React.useState({});

  const eventBox = () => {
    if (isMobile) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", flex: 1, zIndex: 900, position: "fixed", bottom: 0, margin: "auto"}}>
          <EventDetail venue={selectedVenue} event={selectedEvent} />
        </Box>
      );
    }

    const pct = 100 * (width - filterPanelWidth) / (width * 2);
    return (
      <Box sx={{ left: `${pct}%`, transform: `translate(-${pct}%, 0)`, display: "flex", justifyContent: "center", flex: 1, zIndex: 900, position: "fixed", bottom: 0, margin: "auto"}}>
        <EventDetail venue={selectedVenue} event={selectedEvent} />
      </Box>
    );
  }

  return (
    <div className="map-container" style={{ height: `${height - appBarHeight}px`, width: `${(isMobile) ? width : width - filterPanelWidth}px` }}>
      <MapContainer
        center={mapPosition}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={false}
        touchZoom={true}
      >
        <MapData setBannerOpen={setBannerOpen} setSelectedEvent={setSelectedEvent} setSelectedVenue={setSelectedVenue} setMapPosition={setMapPosition} />
      </MapContainer>

      <Fade appear={false} in={bannerOpen}>
        {eventBox()}
      </Fade>
    </div>
  );
}

export default Map;
