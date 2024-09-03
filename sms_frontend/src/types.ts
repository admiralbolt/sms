export type EventType = "Open Mic" | "Open Jam" | "Show";

export interface Event {
  venue: Venue;
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

export type OperationType = "Apply Artists" | "Merge Events";

export const operationTypes: OperationType[] = [
  "Apply Artists",
  "Merge Events",
];

export interface IngestionRunRecord {
  id: number;
  created_at: Date;
  api_name: string;
  change_type: ChangeType;
  change_log: string;
  raw_data: RawData;
}

export interface IngestionRunSummary {
  api_name: string;
  change_type: ChangeType;
  total: number;
  index: number;
}

export interface IngestionRun {
  id: string;
  name: string;
  created_at: Date;
  finished_at: Date;
  run_time: number;
  summary: IngestionRunSummary[];
}

export interface CarpenterRunRecord {
  id: number;
  created_at: Date;
  api_name: string;
  change_type: ChangeType;
  change_log: string;
  field_changed: string;
  raw_data: RawData;
  open_mic: OpenMic;
  event: Event;
  venue: Venue;
  artist: Artist;
}

export interface CarpenterRunSummary {
  api_name: string;
  change_type: ChangeType;
  field_changed: string;
  total: number;
  index: number;
}

export interface CarpenterRun {
  id: string;
  name: string;
  created_at: Date;
  finished_at: Date;
  run_time: number;
  summary: CarpenterRunSummary[];
}

export interface JanitorMergeEventRecord {
  to_event: Event;
}

export interface JanitorApplyArtistRecord {
  event: Event;
  artists: Artist[];
}

export interface JanitorRunRecord {
  id: number;
  created_at: Date;
  operation: OperationType;
  change_log: string;
  merge_event_record: JanitorMergeEventRecord;
  apply_artists_record: JanitorApplyArtistRecord;
}

export interface JanitorRunSummary {
  operation: string;
  total: number;
}

export interface JanitorRun {
  id: number;
  name: string;
  created_at: Date;
  finished_at: Date;
  run_time: number;
  summary: JanitorRunSummary[];
}

export interface RawData {
  id: string;
  api_name: string;
  event_api_id: string;
  event_name: string;
  venue_name: string;
  data: object;
}

export interface Venue {
  id: number;
  slug: string;
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
  neighborhood?: string | null;
}

export interface OpenMic {
  id: number;
  venue: Venue;
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

export interface SocialLink {
  id: number;
  created_at: Date;
  platform: string;
  url: string;
}

export interface Artist {
  id: number;
  name: string;
  bio: string;
  artist_image?: string;
  social_links: SocialLink[];
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
