import { useFilteredEvents } from '../../hooks/filteredData';

const EventList = () => {
  const filteredEvents = useFilteredEvents();

  return (
    <>
    {filteredEvents.map((event) => (
      <p key={event.id}>{event.title}</p>
    ))}
    </>
  )
}

export default EventList;