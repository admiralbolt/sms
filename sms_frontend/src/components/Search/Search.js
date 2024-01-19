import { Box, Divider } from '@mui/material';
import EventDetail from '../EventList/EventDetail';
import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import { useEvents, useVenueMap } from '../../hooks/api';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventsByVenue, eventsByDate] = useEvents();
  const venueMap = useVenueMap();

  const [matches, setMatches] = useState({});


  useEffect(() => {
    let totalMatches = 0;
    let tmpMatches = {};
    for (const [day, eventList] of Object.entries(eventsByDate)) {
      eventList.forEach((event) => {
        if (!event.title.toLowerCase().includes(searchTerm)) return;

        if (!(day in tmpMatches)) {
          tmpMatches[day] = [];
        }

        tmpMatches[day].push(event);
        totalMatches++;
      });
    }

    if (totalMatches <= 60) {
      setMatches(tmpMatches);
    }
  }, [eventsByDate, searchTerm]);    

  return (
    <Box>
      <TextField id="search-input" label="Search!" variant="outlined" fullWidth={true} value={searchTerm}
        onChange={(event) => { setSearchTerm(event.target.value); }} />
        
      { Object.entries(matches).map(([day, eventList], i) => (
        <div key={`wrapper-${day}`}>
          <p key={day}>{day}</p>
          <Divider />
          { eventList.map((event) => (
            <EventDetail key={event.id} venue={venueMap[event.venue]} event={event} />
          ))}
        </div>
      ))}
    </Box>
  )
}

export default Search;