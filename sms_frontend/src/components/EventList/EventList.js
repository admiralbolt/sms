import { useFilteredEvents, useFilteredVenues } from '../../hooks/filteredData';
import { Box } from '@mui/material';
import EventDetail from './EventDetail';

const EventList = () => {
  const filteredVenues = useFilteredVenues();
  const filteredEvents = useFilteredEvents();

  return (
    <Box sx={{ padding: 1.5 }}>
      {filteredEvents.map((event) => (
        <EventDetail venue={filteredVenues[event.venue]} event={event} />
      ))}
    </Box>
  )
}

export default EventList;