// Eventually, we should probably replace the old api entirely.
// For now all things that interact with the *actual* api will be here,
// and all things that interact explicitly with the flat file will be in
// flatFileApi.ts.
import { useEffect, useState } from "react";

import customAxios from "@/hooks/customAxios";
import {
  Event,
  IngestionRun,
  CarpenterRun,
  OpenMic,
  PeriodicTask,
  Venue,
} from "@/types";

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
  updateEvent,
  useEventTypes,
  useIngestionRuns,
  useCarpenterRuns,
  createEvent,
  createVenue,
  updateVenue,
  createOpenMic,
  updateOpenMic,
  useVenueTypes,
  usePeriodicTasks,
  useOpenMics,
  useVenues,
};
