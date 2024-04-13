import { getEventById } from "@/hooks/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Event } from "@/types";
import EventForm from "@/components/EventForm";

const VenueView = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<Event>({});

  useEffect(() => {
    (async () => {
      setEvent(await getEventById(id || 0));
    })();
  }, [id]);

  return (
    <EventForm event={event} />
  );
};

export default VenueView;