import { useFilteredEvents, useFilteredVenues } from '../../hooks/filteredData';
import { Box } from '@mui/material';
import EventDetail from './EventDetail';

const EventList = () => {
  const filteredVenues = useFilteredVenues();
  const filteredEvents = useFilteredEvents();

  const hasVenue = (event) => {
    return event.venue in filteredVenues;
  }

  return (
    <Box>
      {filteredEvents.map((event) => (
        hasVenue(event) &&
          <EventDetail venue={filteredVenues[event.venue]} event={event} />
      ))}
    </Box>
  )
}

export default EventList;