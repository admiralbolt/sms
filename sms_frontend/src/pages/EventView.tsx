import { getEventById, getVenueById } from "@/hooks/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Event, Venue } from "@/types";
import EventForm from "@/components/EventForm";
import EventDetail from "@/components/EventList/EventDetail";

const EventView = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<Event>({});
  const [venue, setVenue] = useState<Venue>({});
  const [edit, setEdit] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setEvent(await getEventById(id || 0));
    })();
  }, [id]);

  useEffect(() => {
    if (event.venue != undefined) {
      console.log(event.venue);
      (async () => {
        setVenue(await getVenueById(event.venue));
      })();
    }
  }, [event]);

  if (edit) {
    return (<EventForm event={event} />);
  } else {
    return (<EventDetail event={event} venue={venue} />);
  }

};

export default EventView;