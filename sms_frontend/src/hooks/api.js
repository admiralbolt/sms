import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { useEffect, useState } from 'react';

const axios = setupCache(Axios);
const baseUrl = (process.env.NODE_ENV === 'production') ? 'https://seattlemusicscene.info:8000' : 'http://192.168.1.2:8000';

const useEventTypes = () => {
  const [eventTypes, setEventTypes] = useState([]);

  useEffect(() => {
    axios.get(`${baseUrl}/api/get_all_event_types`).then((res) => {
      setEventTypes(res.data);
    });
  }, []);

  return eventTypes;
}

const useEvents = () => {
  const [eventsByVenue, setEventsByVenue] = useState({});
  const [eventsByDate, setEventsByDate] = useState({});
  const [allEventsList, setAllEventsList] = useState([]);

  useEffect(() => {
    let tmpEventsByVenue = {};
    let tmpEventsByDate = {};

    axios.get(`${baseUrl}/uploads/latest_events.json`).then((res) => {
      setAllEventsList(res.data);
      
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

  return [eventsByVenue, eventsByDate, allEventsList];
}

const useVenueTypes = () => {
  const [venueTypes, setVenueTypes] = useState([]);

  useEffect(() => {
    axios.get(`${baseUrl}/api/get_all_venue_types`).then((res) => {
      setVenueTypes(res.data);
    });
  }, []);

  return venueTypes;
}

const useVenues = () => {
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    axios.get(`${baseUrl}/uploads/latest_venues.json`).then((res) => {
      setVenues(res.data);
    });
  }, []);

  return venues;
}

const useVenueMap = () => {
  const [venueMap, setVenueMap] = useState({});
  const venues = useVenues();

  useEffect(() => {
    let tmpVenues = {};

    venues.forEach((venue) => {
      tmpVenues[venue.id] = venue;
    });

    setVenueMap(tmpVenues);
  }, [venues]);

  return venueMap;
}

export { useEvents, useEventTypes, useVenues, useVenueTypes, useVenueMap};