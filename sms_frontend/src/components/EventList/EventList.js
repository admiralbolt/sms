import { useEvents, useVenues } from '../../hooks/api';

const EventList = () => {
  const [eventsByVenue, eventsByDate, eventTypes] = useEvents();
  const [venues, venueTypes] = useVenues();

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