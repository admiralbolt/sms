import { Event } from "@/types";

interface Props {
  event: Event;
}

const EventForm = ({ event }: Props) => {
  return (
    <div>
      {Object.keys(event).map((key) => (
        <p key={key}>{key} - {event[key]}</p>
      ))}
    </div>
  );
};

export default EventForm;