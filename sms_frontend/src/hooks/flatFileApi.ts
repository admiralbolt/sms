import { useEffect, useState } from 'react';

import { Event, EventsByDate, EventsByVenue, Venue } from '@/types';

import customAxios from './customAxios';

const useFlatEvents = (): [EventsByVenue, EventsByDate, Event[]] => {
  const [eventsByVenue, setEventsByVenue] = useState<EventsByVenue>({});
  const [eventsByDate, setEventsByDate] = useState<EventsByDate>({});
  const [allEventsList, setAllEventsList] = useState<Event[]>([]);

  useEffect(() => {
    const tmpEventsByVenue: EventsByVenue = {};
    const tmpEventsByDate: EventsByDate = {};

    customAxios.get('/uploads/latest_events.json').then((res) => {
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

const useFlatVenues = (): Venue[] => {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    customAxios.get('uploads/latest_venues.json').then((res) => {
      setVenues(res.data);
    });
  }, []);

  return venues;
};

const useVenueMap = () => {
  const [venueMap, setVenueMap] = useState<{ [id: string]: Venue }>();
  const venues = useFlatVenues();

  useEffect(() => {
    const tmpVenues: { [id: string]: Venue } = {};

    venues.forEach((venue) => {
      tmpVenues[venue.id] = venue;
    });

    setVenueMap(tmpVenues);
  }, [venues]);

  return venueMap;
};

export { useFlatEvents, useFlatVenues, useVenueMap };
