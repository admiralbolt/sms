import { useEffect, useState } from "react";
import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";
import { EventsByDate, EventsByVenue, Event, Venue } from "@/types";

const axios = setupCache(Axios);
const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://seattlemusicscene.info:8000"
    : "http://192.168.1.2:8000";

const useEventTypes = () => {
  const [eventTypes, setEventTypes] = useState([]);

  useEffect(() => {
    axios.get(`${baseUrl}/api/get_all_event_types`).then((res) => {
      setEventTypes(res.data);
    });
  }, []);

  return eventTypes;
};

const useEvents = (): [EventsByVenue, EventsByDate, Event[]] => {
  const [eventsByVenue, setEventsByVenue] = useState<EventsByVenue>({});
  const [eventsByDate, setEventsByDate] = useState<EventsByDate>({});
  const [allEventsList, setAllEventsList] = useState<Event[]>([]);

  useEffect(() => {
    const tmpEventsByVenue: EventsByVenue = {};
    const tmpEventsByDate: EventsByDate = {};

    axios.get(`${baseUrl}/uploads/latest_events.json`).then((res) => {
      setAllEventsList(res.data);

      res.data.forEach((event: Event) => {
        tmpEventsByVenue[event.venue] = tmpEventsByVenue[event.venue] || {};
        tmpEventsByVenue[event.venue][event.event_day.toDateString()] = event;

        if (!(event.event_day.toDateString() in tmpEventsByDate))
          tmpEventsByDate[event.event_day.toDateString()] = [];
        tmpEventsByDate[event.event_day.toDateString()].push(event);
      });

      setEventsByVenue(tmpEventsByVenue);
      setEventsByDate(tmpEventsByDate);
    });
  }, []);

  return [eventsByVenue, eventsByDate, allEventsList];
};

const useVenueTypes = () => {
  const [venueTypes, setVenueTypes] = useState([]);

  useEffect(() => {
    axios.get(`${baseUrl}/api/get_all_venue_types`).then((res) => {
      setVenueTypes(res.data);
    });
  }, []);

  return venueTypes;
};

const useVenues = (): Venue[] => {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    axios.get(`${baseUrl}/uploads/latest_venues.json`).then((res) => {
      setVenues(res.data);
    });
  }, []);

  return venues;
};

const useVenueMap = () => {
  const [venueMap, setVenueMap] = useState<{ [id: string]: Venue }>();
  const venues = useVenues();

  useEffect(() => {
    const tmpVenues: { [id: string]: Venue } = {};

    venues.forEach((venue) => {
      tmpVenues[venue.id] = venue;
    });

    setVenueMap(tmpVenues);
  }, [venues]);

  return venueMap;
};

export { useEvents, useEventTypes, useVenues, useVenueTypes, useVenueMap };
