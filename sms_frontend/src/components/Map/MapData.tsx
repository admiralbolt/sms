import L, { LeafletMouseEvent } from "leaflet";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  Circle,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";

import { Box, Typography } from "@mui/material";

import { LocalStorageContext } from "@/contexts/LocalStorageContext";
import { useFilteredEvents } from "@/hooks/filteredData";
import { useIsMobile } from "@/hooks/window";
import { Event, EventType, Venue } from "@/types";

import "./MapData.css";

const SHOW_COLOR = "#0070ff";
const OPEN_JAM_COLOR = "#ff5500";
const OPEN_MIC_COLOR = "#ee6600";
const NO_EVENT_COLOR = "#989898";

const defaultZoom = 13;

const CIRCLE_SIZES = [
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 80, 80, 80, 60, 37, 25,
  20, 20,
];

declare global {
  interface Window {
    L: typeof L;
  }
}

interface Props {
  setBannerOpen: (isOpen: boolean) => void;
  setSelectedEvent: (event?: Event) => void;
  setMapPosition: (latLing: [number, number]) => void;
}

export const MapData = ({
  setBannerOpen,
  setSelectedEvent,
  setMapPosition,
}: Props) => {
  const map = useMap();
  const filteredEvents = useFilteredEvents();
  const isMobile = useIsMobile();
  const [circleSize, setCircleSize] = useState(CIRCLE_SIZES[defaultZoom]);
  const { selectedDate } = useContext(LocalStorageContext) || {};

  const getColor = (event_type: EventType) => {
    if (event_type == "Open Mic") return OPEN_MIC_COLOR;
    if (event_type == "Open Jam") return OPEN_JAM_COLOR;
    if (event_type == "Show") return SHOW_COLOR;

    return NO_EVENT_COLOR;
  };

  const clearAllHighlights = useCallback(() => {
    map.eachLayer(
      (layer: {
        options: { pane?: string };
        _path?: { classList: { remove: (val: string) => void } };
      }) => {
        if (!layer.options || layer.options.pane != "overlayPane") return;
        if (!layer._path) return;

        layer._path.classList.remove("active");
      },
    );
  }, [map]);

  useEffect(() => {
    setBannerOpen(false);
    clearAllHighlights();
  }, [clearAllHighlights, selectedDate, setBannerOpen]);

  useEffect(() => {
    if (isMobile) map.removeControl(map.zoomControl);
  }, [map, isMobile]);

  const mapEvents = useMapEvents({
    zoomend: () => {
      setCircleSize(CIRCLE_SIZES[mapEvents.getZoom()]);
    },
    click: () => {
      setBannerOpen(false);
      setSelectedEvent();
      clearAllHighlights();
    },
  });

  const handleEventClick = (
    e: LeafletMouseEvent,
    event: Event,
  ) => {
    // We want to center the clicked circle on screen. The math for this gets
    // a little fuzzy. Depends on if we are on mobile or desktop, and we need
    // to adjust the final latitude and longitude accordingly.
    const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
    const zoomScale = map.getZoomScale(defaultZoom, map.getZoom());
    if (isMobile) {
      latlng[0] -= 0.015 * zoomScale;
    } else {
      latlng[0] -= 0.022 * zoomScale;
      latlng[1] += 0.016 * zoomScale;
    }

    clearAllHighlights();
    e.target._path.classList.add("active");

    setMapPosition(latlng);
    map.flyTo(latlng);
    e.originalEvent.view?.L?.DomEvent.stopPropagation(e);
    setSelectedEvent(event);
    setBannerOpen(true);
  };

  const renderEvent = (event: Event) => {
    return (
      <Circle
        key={event.id}
        center={[event.venue.latitude, event.venue.longitude]}
        pathOptions={{
          color: getColor(event.event_type),
          fillColor: getColor(event.event_type),
        }}
        eventHandlers={{
          click: (e: LeafletMouseEvent) => handleEventClick(e, event),
        }}
        radius={circleSize}
      >
        {!isMobile && (
          <Tooltip>
            <Box>
              <Typography>{event.venue.name}</Typography>
            </Box>
          </Tooltip>
        )}
      </Circle>
    );
  };

  return (
    <div>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {filteredEvents.map((event) => renderEvent(event))}
    </div>
  );
};
