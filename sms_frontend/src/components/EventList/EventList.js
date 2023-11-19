import { useEvents, useVenues } from '../../api/api';

const EventList = () => {
  const [eventsByVenue, eventsByDate] = useEvents();
  const [venues] = useVenues();

  console.log('(EventList) keys.length: ' + Object.keys(eventsByDate).length);

  return (
    <>
    {Object.keys(eventsByDate).map((day) => (
      <div key={day}>
        <h2>{day}</h2>
        {eventsByDate[day].map((event) => (
          <p key={event.id}>{event.title}</p>
        ))}
      </div>
    ))}
    </>
  )
}

export default EventList;