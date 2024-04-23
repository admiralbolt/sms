import { getEventById, getVenueById } from "@/hooks/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Event, Venue } from "@/types";
import EventForm from "@/components/EventForm";
import EventDetail from "@/components/EventList/EventDetail";
import { Button } from "@mui/material";

const EventView = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<Event>({});
  const [venue, setVenue] = useState<Venue>({});
  const [edit, setEdit] = useState<boolean>(false);

  const toggleEdit = () => {
    setEdit(!edit);
  }

  useEffect(() => {
    (async () => {
      setEvent(await getEventById(id || 0));
    })();
  }, [id]);

  useEffect(() => {
    if (event.venue != undefined) {
      (async () => {
        setVenue(await getVenueById(event.venue));
      })();
    }
  }, [event]);
  
  const renderMainContent = () => {
    if (edit) {
      return (<EventForm setEdit={setEdit} event={event} setEvent={setEvent} />);
    } else {
      return (<EventDetail event={event} venue={venue} />);
    }
  }

  return (
    <div>
      <Button onClick={toggleEdit}>Toggle Edit</Button>
      <br />
      {renderMainContent()}
    </div>
  );

};

export default EventView;