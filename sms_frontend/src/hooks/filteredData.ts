import { Event, EventsByVenueMap, Venue } from "@/types.js";
import { LocalStorageContext } from "../contexts/LocalStorageContext.js";
import { useFlatEvents, useFlatVenues } from "./flatFileApi.js";
import { useContext, useEffect, useState } from "react";

const useFilteredVenues = () => {
  const venues = useFlatVenues();
  const { selectedVenueTypes } = useContext(LocalStorageContext) || {};
  const [filteredVenues, setFilteredVenues] = useState<{
    [key: string]: Venue;
  }>({});

  useEffect(() => {
    const tmpVenues: { [key: string]: Venue } = {};

    venues.forEach((venue) => {
      // TODO(admiralbolt): Put this back -- Temporarily removing venue filters.
      // if (!(venue.venue_tags.some((venue_type) => selectedVenueTypes.includes(venue_type)))) return;

      tmpVenues[venue.id] = venue;
    });

    setFilteredVenues(tmpVenues);
  }, [venues, selectedVenueTypes]);

  return filteredVenues;
};

const useFilteredEvents = () => {
  const [_, eventsByDate] = useFlatEvents();
  const { selectedEventTypes, selectedDate } =
    useContext(LocalStorageContext) || {};
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  useEffect(() => {
    const targetDate = selectedDate?.format("YYYY-MM-DD");
    if (targetDate && targetDate in eventsByDate) {
      const events = eventsByDate[targetDate];
      setFilteredEvents(
        events.filter((event) => {
          return selectedEventTypes?.includes(event.event_type);
        })
      );
    }
  }, [eventsByDate, selectedEventTypes, selectedDate]);

  return filteredEvents;
};

const useFilteredEventsByVenue = () => {
  const [filteredEventsByVenue, setFilteredEventsByVenue] =
    useState<EventsByVenueMap>();
  const filteredEvents = useFilteredEvents();

  useEffect(() => {
    const eventMap: EventsByVenueMap = {};
    filteredEvents.forEach((event) => {
      eventMap[event.venue] = event;
    });
    setFilteredEventsByVenue(eventMap);
  }, [filteredEvents]);

  return filteredEventsByVenue;
};

export { useFilteredEvents, useFilteredEventsByVenue, useFilteredVenues };
