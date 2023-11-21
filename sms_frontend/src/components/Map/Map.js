import React, { useEffect, useState } from 'react';
import './Map.css';

import MapData from './MapData.js';
import { useIsMobile, useWindowDimensions } from '../../hooks/window';
import { useAppBarHeight, useFilterPanelWidth } from '../../hooks/materialHacks';

import { useMap, useMapEvents, MapContainer, TileLayer, Marker, Popup, Tooltip, Circle } from 'react-leaflet'

import { Box, Button, Fade, Paper, Stack, Typography } from '@mui/material';
import EventDetail from '../EventList/EventDetail.js';

const position = [47.65113, -122.3400];
const zoom = 13;

const Map = () => {
  const { height, width } = useWindowDimensions();
  const isMobile = useIsMobile();
  const appBarHeight = useAppBarHeight();
  const filterPanelWidth = useFilterPanelWidth();

  const [bannerOpen, setBannerOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState({});
  const [selectedVenue, setSelectedVenue] = React.useState({});

  return (
    <div className="map-container" style={{ height: `${height - appBarHeight}px`, width: `${(isMobile) ? width : width - filterPanelWidth}px` }}>
      <MapContainer
        center={position}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={false}
        touchZoom={true}
      >
        <MapData setBannerOpen={setBannerOpen} setSelectedEvent={setSelectedEvent} setSelectedVenue={setSelectedVenue} />
      </MapContainer>

      <Fade appear={false} in={bannerOpen}>
        <Box sx={{ display: "flex", justifyContent: "center", flex: 1, zIndex: 100000, position: "fixed", bottom: 0, margin: "auto"}}>
          <EventDetail venue={selectedVenue} event={selectedEvent} />
        </Box>
      </Fade>
    </div>
  );
}

export default Map;
