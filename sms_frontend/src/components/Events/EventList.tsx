import { useContext, useEffect, useRef } from 'react';

import { List, ListItem } from '@mui/material';

import { Event } from '@/types';

import { LocalStorageContext } from '../../contexts/LocalStorageContext';
import { useFilteredEvents, useFilteredVenues } from '../../hooks/filteredData';
import EventCard from './EventCard';

const EventList = () => {
  const listContainer = useRef<HTMLUListElement>(null);
  const filteredVenues = useFilteredVenues();
  const filteredEvents = useFilteredEvents();
  const { selectedDate } = useContext(LocalStorageContext) || {};

  const hasVenue = (event: Event) => {
    return event.venue in filteredVenues;
  };

  useEffect(() => {
    setTimeout(() => {
      if (listContainer.current) {
        listContainer.current.scrollTop = 0;
      }
    }, 1);
  }, [selectedDate]);

  return (
    <List
      ref={listContainer}
      sx={{
        maxHeight: '100vh',
        paddingBottom: '10rem',
        overflow: 'auto',
      }}
    >
      {filteredEvents.map(
        (event) =>
          hasVenue(event) && (
            <ListItem sx={{ padding: 0 }} key={event.id}>
              <EventCard event={event} />
            </ListItem>
          ),
      )}
    </List>
  );
};

export default EventList;
