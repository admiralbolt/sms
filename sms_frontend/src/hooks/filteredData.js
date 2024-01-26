import { LocalStorageContext } from '../contexts/LocalStorageContext';
import { useEvents, useVenues } from './api.js';
import { useContext, useEffect, useState } from 'react';

const useFilteredVenues = () => {
  const venues = useVenues();
  const { selectedVenueTypes } = useContext(LocalStorageContext);
  const [filteredVenues, setFilteredVenues] = useState({});

  useEffect(() => {
    let tmpVenues = {};

    venues.forEach((venue) => {
      // TODO(admiralbolt): Put this back -- Temporarily removing venue filters.
      // if (!(venue.venue_tags.some((venue_type) => selectedVenueTypes.includes(venue_type)))) return;

      tmpVenues[venue.id] = venue;
    });

    setFilteredVenues(tmpVenues);
  }, [venues, selectedVenueTypes]);
  
  return filteredVenues;
}

const useFilteredEvents = () => {
  const [eventsByVenue, eventsByDate] = useEvents();
  const { selectedEventTypes, selectedDate } = useContext(LocalStorageContext);
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    const targetDate = selectedDate.format('YYYY-MM-DD');
    if (targetDate in eventsByDate) {
      setFilteredEvents(eventsByDate[targetDate].filter((event) => {
        return selectedEventTypes.includes(event.event_type)
      }));
    }
  }, [eventsByDate, selectedEventTypes, selectedDate]);

  return filteredEvents;
}

const useFilteredEventsByVenue = () => {
  const [filteredEventsByVenue, setFilteredEventsByVenue] = useState({});
  const filteredEvents = useFilteredEvents();

  useEffect(() => {
    let eventMap = {};
    filteredEvents.forEach((event) => {
      eventMap[event.venue] = event;
    });
    setFilteredEventsByVenue(eventMap);
  }, [filteredEvents]);

  return filteredEventsByVenue;
}

export { useFilteredEvents, useFilteredEventsByVenue, useFilteredVenues }