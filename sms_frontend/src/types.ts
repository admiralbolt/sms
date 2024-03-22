export type EventType = "Open Mic" | "Open Jam" | "Show";

export interface Event {
  venue: string;
  event_day: string;
  event_type: EventType;
  id: string;
  start_time: string;
  event_image?: string;
  title: string;
  event_url?: string | null;
  // Add other properties of event here as needed
}

export interface Venue {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  venue_image: string;
  venue_url?: string | null;
  address: string;
  city: string;
  postal_code: string;
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
