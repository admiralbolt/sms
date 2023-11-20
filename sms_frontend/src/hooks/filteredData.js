import { LocalStorageContext } from '../contexts/LocalStorageContext';
import { useEvents, useVenues } from './api.js';
import { useContext, useEffect, useState } from 'react';

const useFilteredVenues = () => {
  const [venues, venueTypes] = useVenues();
  const { selectedEventTypes, setSelectedEventTypes, selectedVenueTypes, setSelectedVenueTypes, selectedDate, setSelectedDate } = useContext(LocalStorageContext);
  const [filteredVenues, setFilteredVenues] = useState([]);

  useEffect(() => {
    setFilteredVenues(venues.filter((venue) => {
      return selectedVenueTypes.includes(venue.venue_type);
    }));
  }, [venues, selectedVenueTypes]);
  
  return filteredVenues;
}

const useFilteredEvents = () => {
  const [eventsByVenue, eventsByDate, eventTypes] = useEvents();
  const { selectedEventTypes, setSelectedEventTypes, selectedVenueTypes, setSelectedVenueTypes, selectedDate, setSelectedDate } = useContext(LocalStorageContext);
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