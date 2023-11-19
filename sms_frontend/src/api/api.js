import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { useEffect, useState } from 'react';

const axios = setupCache(Axios);

const useEvents = () => {
  const [eventsByVenue, setEventsByVenue] = useState({});
  const [eventsByDate, setEventsByDate] = useState({});

  useEffect(() => {
    let tmpEventsByVenue = {};
    let tmpEventsByDate = {};

    axios.get('/api/events').then((res) => {
      res.data.forEach(event => {
        tmpEventsByVenue[event.venue] = tmpEventsByVenue[event.venue] || {};
        tmpEventsByVenue[event.venue][event.event_day] = event;

        if (!(event.event_day in tmpEventsByDate))
          tmpEventsByDate[event.event_day] = [];
        tmpEventsByDate[event.event_day].push(event);
      });

      setEventsByVenue(tmpEventsByVenue);
      setEventsByDate(tmpEventsByDate);
    });
    
  }, []);

  return [eventsByVenue, eventsByDate];
}

const useVenues = () => {
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    axios.get('/api/venues').then((res) => {
      setVenues(res.data);
    });
  }, []);

  return [venues];
}

const hasShow = (events, venue, date) => {
  if (!(venue.id in events)) return false;
  if (!(date in events[venue.id])) return false;

  return true;
}


export { hasShow, useEvents, useVenues};