import { useContext, useEffect, useRef } from "react";

import { Box, CircularProgress, List, ListItem } from "@mui/material";

import { LocalStorageContext } from "@/contexts/LocalStorageContext";
import { useEventsLoading, useFilteredEvents } from "@/hooks/filteredData";

import { EventCard } from "./EventCard";

export const EventList = () => {
  const listContainer = useRef<HTMLUListElement>(null);
  const filteredEvents = useFilteredEvents();
  const { eventsLoading } = useEventsLoading();
  const { selectedDate } = useContext(LocalStorageContext) || {};

  useEffect(() => {
    setTimeout(() => {
      if (listContainer.current) {
        listContainer.current.scrollTop = 0;
      }
    }, 1);
  }, [selectedDate]);

  if (eventsLoading) {
    return (
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2em"}}>
        <CircularProgress size={45} />
      </Box>
    );
  }

  return (
    <List
      ref={listContainer}
      sx={{
        paddingBottom: "2rem",
      }}
    >
      {filteredEvents.map((event) => (
        <ListItem sx={{ padding: 0 }} key={event.id}>
          <EventCard event={event} />
        </ListItem>
      ))}
    </List>
  );
};
