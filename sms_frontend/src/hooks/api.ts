import { useEffect, useState } from "react";
import { EventsByDate, EventsByVenue, Event, Venue, OpenMic } from "@/types";
import customAxios from "./customAxios";

const useEventTypes = () => {
  const [eventTypes, setEventTypes] = useState([]);

  useEffect(() => {
    customAxios.get("/api/get_all_event_types").then((res) => {
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

    customAxios.get("/uploads/latest_events.json").then((res) => {
      setAllEventsList(res.data);

      res.data.forEach((event: Event) => {
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
};

const useVenueTypes = () => {
  const [venueTypes, setVenueTypes] = useState([]);

  useEffect(() => {
    customAxios.get("api/get_all_venue_types").then((res) => {
      setVenueTypes(res.data);
    });
  }, []);

  return venueTypes;
};

const useVenues = (): Venue[] => {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    customAxios.get("uploads/latest_venues.json").then((res) => {
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

const getVenueById = async (id: any): Promise<Venue> => {
  const result = await customAxios.get(`/api/venues/${id}`);

  return result.data;
};

const getEventById = async (id: any): Promise<Event> => {
  const result = await customAxios.get(`/api/events/${id}`);

  return result.data;
};

const getOpenMicById = async (id: any): Promise<OpenMic> => {
  const result = await customAxios.get(`/api/open_mics/${id}`);

  return result.data;
};

export {
  getEventById,
  getOpenMicById,
  getVenueById,
  useEvents,
  useEventTypes,
  useVenues,
  useVenueTypes,
  useVenueMap,
};
