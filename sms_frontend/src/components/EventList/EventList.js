import { useFilteredEvents } from '../../hooks/filteredData';
import { Box } from '@mui/material';

const EventList = () => {
  const filteredEvents = useFilteredEvents();

  return (
    <Box sx={{ padding: 1.5 }}>
      {filteredEvents.map((event) => (
        <p key={event.id}>{event.title}</p>
      ))}
    </Box>
  )
}

export default EventList;