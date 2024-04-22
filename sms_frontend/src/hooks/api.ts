// Eventually, we should probably replace the old api entirely.
// For now all things that interact with the *actual* api will be here,
// and all things that interact explicitly with the flat file will be in
// flatFileApi.ts.

import { useEffect, useState } from "react";

import customAxios from "@/hooks/customAxios";
import { Event, OpenMic, Venue } from "@/types";

const getVenueById = async (id: any): Promise<Venue> => {
  const result = await customAxios.get(`/api/venues/${id}`);

  return result.data;
}

const getEventById = async (id: any): Promise<Event> => {
  const result = await customAxios.get(`/api/events/${id}`);

  return result.data;
}

const getOpenMicById = async (id: any): Promise<OpenMic> => {
  const result = await customAxios.get(`/api/open_mics/${id}`);

  return result.data;
}

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

const updateEvent = (event: Event) => {
  // Until we get file uploading from the UI figured out, we want to avoid
  // making updates directly to the "event_image" field.
  delete event.event_image;

  return customAxios.put(`api/events/${event.id}`, event);
}

const useVenues = () => {
  const [venues, setVenues] = useState<[Venue]>([]);

  useEffect(() => {
    customAxios.get("api/venues").then((res) => {
      setVenues(res.data);
    });
  }, []);

  return venues;
}

export { getEventById, getOpenMicById, getVenueById, updateEvent, useEventTypes, useVenueTypes, useVenues };