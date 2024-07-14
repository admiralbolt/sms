import { useEffect, useState } from "react";

import { useLocalStorageContext } from "@/contexts/LocalStorageContext.js";
import { Event } from "@/types.js";

import { useSelectedDateEvents } from "./api.js";

const useFilteredEvents = () => {
  const { selectedVenueTypes, selectedEventTypes } = useLocalStorageContext();
  const { selectedDateEvents } = useSelectedDateEvents();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!selectedDateEvents) return;

    // Eventually, we'll want to add venue filtering here as well.
    setFilteredEvents(
      selectedDateEvents.filter((event: Event) => {
        return selectedEventTypes?.includes(event.event_type);
      }),
    );
  }, [selectedDateEvents, selectedEventTypes, selectedVenueTypes]);

  return filteredEvents;
};

export { useFilteredEvents };
