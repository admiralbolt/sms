import React, { useEffect, useState } from 'react';
import './Map.css';

import MapData from './MapData.js';
import { useIsMobile, useWindowDimensions } from '../../hooks/window';
import { useAppBarHeight, useFilterPanelWidth } from '../../hooks/materialHacks';

import { useMap, useMapEvents, MapContainer, TileLayer, Marker, Popup, Tooltip, Circle } from 'react-leaflet'

const position = [47.65113, -122.3400];
const zoom = 13;

const Map = () => {
  const { height, width } = useWindowDimensions();
  const isMobile = useIsMobile();
  const appBarHeight = useAppBarHeight();
  const filterPanelWidth = useFilterPanelWidth();

  return (
    <div className="map-container" style={{ height: `${height - appBarHeight}px`, width: `${(isMobile) ? width : width - filterPanelWidth}px` }}>
      <MapContainer
        center={position}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={false}
        touchZoom={true}
      >
        <MapData />
      </MapContainer>
    </div>
  );
}

export default Map;
