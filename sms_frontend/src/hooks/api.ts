// Eventually, we should probably replace the old api entirely.
// For now all things that interact with the *actual* api will be here,
// and all things that interact explicitly with the flat file will be in
// flatFileApi.ts.
import { useEffect, useState } from "react";

import customAxios from "@/hooks/customAxios";
import {
  Artist,
  CarpenterRun,
  Event,
  IngestionRun,
  OpenMic,
  PeriodicTask,
  SocialLink,
  Venue,
} from "@/types";

const BASE_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://seattlemusicscene.info:8000"
    : "http://localhost:8000";

const getEventDisplayImage = (event: Event): string => {
  if (event.event_image) return BASE_API_URL + event.event_image;
  if (event.venue.venue_image) return BASE_API_URL + event.venue.venue_image;

  return "/placeholder.png";
}

const getVenueDisplayImage = (venue: Venue): string => {
  if (venue.venue_image) return BASE_API_URL + venue.venue_image;

  return "/placeholder.png";
}

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

// Cache for fast loading.
const eventsByDay: {[key: string]: Event[]} = {};
const getEventsByDay = async (day: string): Promise<Event[]> => {
  if (!(day in eventsByDay)) {
    const result = await customAxios.get(`/api/get_events_on_day?day=${day}`);
    eventsByDay[day] = result.data;
  }

  return eventsByDay[day];
};

const useEventTypes = () => {
  const [eventTypes, setEventTypes] = useState([]);

  useEffect(() => {
    customAxios.get("/api/get_all_event_types").then((res) => {
      setEventTypes(res.data);
    });
  }, []);

  return eventTypes;
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

const createEvent = (event: Event) => {
  // Until we get file uploading from the UI figured out, we want to avoid
  // making updates directly to the "event_image" field.
  delete event.event_image;

  return customAxios.post(`api/events`, event);
};

const updateEvent = (event: Event) => {
  // Until we get file uploading from the UI figured out, we want to avoid
  // making updates directly to the "event_image" field.
  delete event.event_image;

  return customAxios.put(`api/events/${event.id}`, event);
};

const createArtist = (artist: Artist) => {
  return customAxios.post(`api/artists`, artist);
};

const updateArtist = (artist: Artist) => {
  // Until we get file uploading from the UI figured out, we want to avoid
  // making updates directly to the "artist_image" field.
  delete artist.artist_image;

  return customAxios.put(`api/artists/${artist.id}`, artist);
};

const createVenue = (venue: Venue) => {
  return customAxios.post(`api/venues`, venue);
};

const updateVenue = (venue: Venue) => {
  // Until we get file uploading from the UI figured out, we want to avoid
  // making updates directly to the "venue_image" field.
  delete venue.venue_image;

  return customAxios.put(`api/venues/${venue.id}`, venue);
};

const createOpenMic = (openMic: OpenMic) => {
  return customAxios.post(`api/open_mics`, openMic);
};

const updateOpenMic = (openMic: OpenMic) => {
  return customAxios.put(`api/open_mics/${openMic.id}`, openMic);
};

const useOpenMics = (): [
  OpenMic[],
  React.Dispatch<React.SetStateAction<OpenMic[]>>,
] => {
  const [openMics, setOpenMics] = useState<OpenMic[]>([]);

  useEffect(() => {
    customAxios.get("api/open_mics").then((res) => {
      setOpenMics(res.data);
    });
  }, []);

  return [openMics, setOpenMics];
};

const useArtists = (): [
  Artist[],
  React.Dispatch<React.SetStateAction<Artist[]>>,
] => {
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    customAxios.get("api/artists").then((res) => {
      setArtists(res.data);
    });
  }, []);

  return [artists, setArtists];
};

const useVenues = (): [
  Venue[],
  React.Dispatch<React.SetStateAction<Venue[]>>,
] => {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    customAxios.get("api/venues").then((res) => {
      setVenues(res.data);
    });
  }, []);

  return [venues, setVenues];
};

const usePeriodicTasks = (): PeriodicTask[] => {
  const [tasks, setTasks] = useState<PeriodicTask[]>([]);

  useEffect(() => {
    customAxios.get("api/celery").then((res) => {
      setTasks(res.data);
    });
  }, []);

  return tasks;
};

const useIngestionRuns = (): IngestionRun[] => {
  const [runs, setRuns] = useState<IngestionRun[]>([]);

  useEffect(() => {
    customAxios.get("api/ingestion_runs").then((res) => {
      setRuns(res.data);
    });
  }, []);

  return runs;
};

const useCarpenterRuns = (): CarpenterRun[] => {
  const [runs, setRuns] = useState<CarpenterRun[]>([]);

  useEffect(() => {
    customAxios.get("api/carpenter_runs").then((res) => {
      setRuns(res.data);
    });
  }, []);

  return runs;
};

export {
  getEventById,
  getOpenMicById,
  getVenueById,
  getEventsByDay,
  updateEvent,
  useEventTypes,
  useIngestionRuns,
  useCarpenterRuns,
  createArtist,
  updateArtist,
  createEvent,
  createVenue,
  updateVenue,
  createOpenMic,
  updateOpenMic,
  useArtists,
  useVenueTypes,
  usePeriodicTasks,
  useOpenMics,
  useVenues,
  getEventDisplayImage,
  getVenueDisplayImage
};
