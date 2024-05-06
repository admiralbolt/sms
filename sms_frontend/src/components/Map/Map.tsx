import { LatLngExpression } from "leaflet";
import React, { useState } from "react";
import { MapContainer } from "react-leaflet";

import { Box, Fade } from "@mui/material";

import { EventCard } from "@/components/Events/EventCard";
import { useAppBarHeight, useFilterPanelWidth } from "@/hooks/materialHacks";
import { useIsMobile, useWindowDimensions } from "@/hooks/window";
import { Event, Venue } from "@/types";

import { MapData } from "./MapData";

const zoom = 13;

export const Map = () => {
  const { height, width } = useWindowDimensions();
  const isMobile = useIsMobile();
  const appBarHeight = useAppBarHeight();
  const filterPanelWidth = useFilterPanelWidth();

  const [mapPosition, setMapPosition] = useState<LatLngExpression>([
    47.65113, -122.34,
  ]);
  const [bannerOpen, setBannerOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event>();
  const [selectedVenue, setSelectedVenue] = useState<Venue>();

  const eventBox = () => {
    if (isMobile) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flex: 1,
            zIndex: 900,
            position: "fixed",
            bottom: 0,
            margin: "auto",
          }}
        >
          {selectedVenue && selectedEvent && (
            <EventCard event={selectedEvent} />
          )}
        </Box>
      );
    }

    const pct = (100 * (width - filterPanelWidth)) / (width * 2);
    return (
      <Box
        sx={{
          left: `${pct}%`,
          transform: `translate(-${pct}%, 0)`,
          display: "flex",
          justifyContent: "center",
          flex: 1,
          zIndex: 900,
          position: "fixed",
          bottom: 0,
          margin: "auto",
        }}
      >
        {selectedVenue && selectedEvent && <EventCard event={selectedEvent} />}
      </Box>
    );
  };

  return (
    <div
      className="map-container"
      style={{
        height: `${height - appBarHeight}px`,
        width: `${isMobile ? width : width - filterPanelWidth}px`,
      }}
    >
      <MapContainer
        center={mapPosition}
        zoom={zoom}
        zoomControl={!isMobile}
        scrollWheelZoom={false}
        touchZoom={true}
      >
        <MapData
          setBannerOpen={setBannerOpen}
          setSelectedEvent={setSelectedEvent}
          setSelectedVenue={setSelectedVenue}
          setMapPosition={setMapPosition}
        />
      </MapContainer>

      <Fade appear={false} in={bannerOpen}>
        {eventBox()}
      </Fade>
    </div>
  );
};