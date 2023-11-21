import { Box } from '@mui/material';

const EventDetail = ({ venue, event}) => {

  return (
    <Box sx={{ padding: 1.5 }}>
      Venue Name: {venue.name} <br />
      Event Title: {event.title} <br />
      Event URL: {event.url} <br />
    </Box>
  )
}

export default EventDetail;