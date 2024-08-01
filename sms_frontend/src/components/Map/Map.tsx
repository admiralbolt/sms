import { LatLngExpression } from "leaflet";
import React, { useState } from "react";
import { MapContainer } from "react-leaflet";

import { Box, Fade } from "@mui/material";

import { EventCard } from "@/components/Events/EventCard";
import { useAppBarHeight, useFilterPanelWidth } from "@/hooks/materialHacks";
import { useIsMobile, useWindowDimensions } from "@/hooks/window";
import { Event } from "@/types";

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

  const eventBox = () => {
    if (isMobile) {
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            zIndex: 900,
            position: "fixed",
            bottom: "2em",
            margin: "auto",
            backgroundColor: "#252530",
            borderRadius: "0.3em",
            width: "100vw",
          }}
        >
          {selectedEvent && <EventCard event={selectedEvent} size="small" />}
        </Box>
      );
    }

    const offset = (width - filterPanelWidth) / 2 - 450;
    console.log(offset);
    return (
      <Box
        sx={{
          left: `${offset}px`,
          display: "flex",
          flex: 1,
          zIndex: 900,
          position: "fixed",
          bottom: "2em",
          margin: "auto",
          backgroundColor: "#252530",
          borderRadius: "0.3em",
        }}
      >
        {selectedEvent && <EventCard event={selectedEvent} size="large" />}
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
          setMapPosition={setMapPosition}
        />
      </MapContainer>

      <Fade appear={false} in={bannerOpen}>
        <Box sx={{ backgroundColor: "black" }}>{eventBox()}</Box>
      </Fade>
    </div>
  );
};
