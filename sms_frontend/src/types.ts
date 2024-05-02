export type EventType = "Open Mic" | "Open Jam" | "Show";

export interface Event {
  venue: number;
  event_day: string;
  event_type: EventType;
  id: number;
  start_time: string;
  event_image?: string;
  title: string;
  event_url?: string | null;
  // Add other properties of event here as needed
}

export type ChangeType =
  | "Create"
  | "Delete"
  | "Update"
  | "Error"
  | "NO OP"
  | "Skip"
  | "Update";

export const changeTypes: ChangeType[] = [
  "Create",
  "Delete",
  "Update",
  "Error",
  "NO OP",
  "Skip",
];

export interface IngestionRunRecord {
  id: number;
  created_at: Date;
  api_name: string;
  change_type: ChangeType;
  change_log: string;
  field_changed: string;
  event: number;
  event_name: string;
  venue: number;
  venue_name: string;
}

export interface IngestionRunSummary {
  api_name: string;
  change_type: string;
  field_changed: string;
  total: number;
  index: number;
}

export interface IngestionRun {
  id: string;
  name: string;
  created_at: Date;
  summary: IngestionRunSummary[];
}

export interface Venue {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  description: string;
  venue_image?: string;
  venue_url?: string | null;
  address: string;
  city: string;
  postal_code: string;
  alias: string;
  show_venue: boolean;
  gather_data: boolean;
}

export interface OpenMic {
  id: number;
  venue: number;
  name: string;
  event_mic_type: EventType;
  open_mic_type: string;
  description: string;
  all_ages?: boolean;
  house_piano?: boolean;
  house_pa?: boolean;
  drums?: boolean;
  cadence_crontab: string;
  cadence_readable: string;
  signup_start_time: string;
  event_start_time: string;
}

export interface Crontab {
  schedule: string;
  healthy_last_run: Date;
}

export interface PeriodicTask {
  id: string;
  name: string;
  enabled: boolean;
  last_run_at: Date;
  healthy: boolean;
  total_run_count: number;
  crontab: Crontab;
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
