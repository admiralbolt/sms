import { useEffect, useState } from "react";

import { useLocalStorageContext } from "@/contexts/LocalStorageContext.js";
import { Event } from "@/types.js";

import { getEventsByDay } from "./api.js";

const useEventsLoading = () => {
  const [eventsLoading, setEventsLoading] = useState<boolean>(false);

  return { eventsLoading, setEventsLoading };
};

const useSelectedDateEvents = () => {
  const { selectedDate } = useLocalStorageContext();
  const [events, setEvents] = useState<Event[]>([]);
  const { setEventsLoading } = useEventsLoading();

  useEffect(() => {
    setEventsLoading(true);
    (async () => {
      setEvents(await getEventsByDay(selectedDate.format("YYYY-MM-DD")));
    })();
  }, [selectedDate]);

  return events;
};

const useFilteredEvents = () => {
  const { selectedVenueTypes, selectedEventTypes } = useLocalStorageContext();
  const selectedDateEvents = useSelectedDateEvents();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const { setEventsLoading } = useEventsLoading();

  useEffect(() => {
    // Eventually, we'll want to add venue filtering here as well.
    setFilteredEvents(
      selectedDateEvents.filter((event: Event) => {
        return selectedEventTypes?.includes(event.event_type);
      }),
    );
    setEventsLoading(false);
  }, [selectedDateEvents, selectedEventTypes, selectedVenueTypes]);

  return filteredEvents;
};

export { useFilteredEvents, useEventsLoading };
