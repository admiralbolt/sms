import { useEffect, useRef, useState } from "react";

import { useLocalStorageContext } from "@/contexts/LocalStorageContext";
import customAxios from "@/hooks/customAxios";
import {
  Artist,
  CarpenterRun,
  Event,
  IngestionRun,
  JanitorRun,
  OpenMic,
  PeriodicTask,
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
};

const getVenueDisplayImage = (venue: Venue): string => {
  if (venue.venue_image) return BASE_API_URL + venue.venue_image;

  return "/placeholder.png";
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

const getArtistById = async (id: any): Promise<Artist> => {
  const result = await customAxios.get(`/api/artists/${id}`);

  return result.data;
};

const getEventsByDay = async (day: string): Promise<Event[]> => {
  const result = await customAxios.get(`/api/get_events_on_day?day=${day}`);

  return result.data;
};

const useSelectedDateEvents = () => {
  const eventsByDay = useRef<{ [key: string]: Event[] }>({});
  const { selectedDate } = useLocalStorageContext();
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedDate) return;

    setEventsLoading(true);
    const targetDate = selectedDate.format("YYYY-MM-DD");

    (async () => {
      if (!(targetDate in eventsByDay.current)) {
        const result = await getEventsByDay(targetDate);
        eventsByDay.current[targetDate] = result;
      }

      setSelectedDateEvents(eventsByDay.current[targetDate]);
      setEventsLoading(false);
    })();
  }, [eventsByDay, selectedDate]);

  return { selectedDateEvents, eventsLoading };
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

const useJanitorRuns = (): JanitorRun[] => {
  const [runs, setRuns] = useState<JanitorRun[]>([]);

  useEffect(() => {
    customAxios.get("api/janitor_runs").then((res) => {
      setRuns(res.data);
    });
  }, []);

  return runs;
};

export {
  getArtistById,
  getEventById,
  getOpenMicById,
  getVenueById,
  getEventsByDay,
  updateEvent,
  useEventTypes,
  useIngestionRuns,
  useCarpenterRuns,
  useJanitorRuns,
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
  getVenueDisplayImage,
  useSelectedDateEvents,
};
