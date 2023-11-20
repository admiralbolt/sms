import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { useEffect, useState } from 'react';

const axios = setupCache(Axios);

const useEvents = () => {
  const [eventsByVenue, setEventsByVenue] = useState({});
  const [eventsByDate, setEventsByDate] = useState({});
  const [eventTypes, setEventTypes] = useState([]);

  useEffect(() => {
    let tmpEventsByVenue = {};
    let tmpEventsByDate = {};
    let tmpEventTypes = new Set();

    axios.get('/api/events').then((res) => {
      res.data.forEach(event => {
        tmpEventsByVenue[event.venue] = tmpEventsByVenue[event.venue] || {};
        tmpEventsByVenue[event.venue][event.event_day] = event;

        if (!(event.event_day in tmpEventsByDate))
          tmpEventsByDate[event.event_day] = [];
        tmpEventsByDate[event.event_day].push(event);
        tmpEventTypes.add(event.event_type);
      });

      setEventsByVenue(tmpEventsByVenue);
      setEventsByDate(tmpEventsByDate);
      let data = Array.from(tmpEventTypes);
      data.sort();
      setEventTypes(data);
    });
    
  }, []);

  return [eventsByVenue, eventsByDate, eventTypes];
}

const useVenues = () => {
  const [venues, setVenues] = useState([]);
  const [venueTypes, setVenueTypes] = useState([]);

  useEffect(() => {
    let tmpVenueTypes = new Set();

    axios.get('/api/venues').then((res) => {
      setVenues(res.data);
      res.data.forEach((venue) => {
        tmpVenueTypes.add(venue.venue_type);
      });
      
      let data = Array.from(tmpVenueTypes);
      data.sort();
      setVenueTypes(data);
    });
  }, []);

  return [venues, venueTypes];
}

export { useEvents, useVenues};