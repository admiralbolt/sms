export type EventType = "Open Mic" | "Open Jam" | "Show";

export interface Event {
  venue: string;
  event_day: string;
  event_type: EventType;
  id: string;
  // Add other properties of event here as needed
}

export interface Venue {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
}
export interface EventsByVenue {
  [venue: string]: {
    [event_day: string]: Event;
  };
}

export interface EventsByVenueMap {
  [venue: string]: Event;
}

export interface EventsByDate {
  [event_day: string]: Event[];
}
