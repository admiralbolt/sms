import React, { useEffect, useState } from 'react';
import './Map.css';

import MapData from './MapData.js';

import axios from 'axios';

import { useMap, useMapEvents, MapContainer, TileLayer, Marker, Popup, Tooltip, Circle } from 'react-leaflet'

const SHOW_COLOR = '#0070ff';
const OPEN_MIC_COLOR = '#ee6600';
const NO_EVENT_COLOR = '#989898';

const position = [47.65113, -122.3400];
const zoom = 13;

const Map = ({ date }) => {
  return (
    <MapContainer
      center={position}
      zoom={zoom}
      zoomControl={false}
      scrollWheelZoom={false}
      touchZoom={true}
    >
      <MapData date={date} />
    </MapContainer>
  );
}

export default Map;
