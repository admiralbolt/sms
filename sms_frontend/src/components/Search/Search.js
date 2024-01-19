import { Box, Divider } from '@mui/material';
import EventDetail from '../EventList/EventDetail';
import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import { useEvents, useVenueMap } from '../../hooks/api';
import Fuse from 'fuse.js';
import { Typography } from '@mui/material';

const MAX_RESULTS = 50;

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventsByVenue, eventsByDate, allEventsList] = useEvents();
  const venueMap = useVenueMap();

  const [matches, setMatches] = useState([]);
  const [fuse, setFuse] = useState(null);

  const fuseOptions = {
    isCaseSensitive: false,
    includeScore: true,
    shouldSort: true,
    includeMatches: true,
    findAllMatches: true,
    minMatchCharLength: 2,
    threshold: 0.2,
    ignoreLocation: true,
    ignoreFieldNorm: true,
    keys: [
      'title'
    ]
  };

  useEffect(() => {
    setFuse(new Fuse(allEventsList, fuseOptions));
  }, [allEventsList]);

  useEffect(() => {
    if (fuse == null) return;

    const matchList = fuse.search(searchTerm);
    setMatches(matchList.slice(0, MAX_RESULTS));
  }, [fuse, searchTerm]);

  return (
    <Box>
      <TextField id="search-input" label="Search!" variant="outlined" fullWidth={true} value={searchTerm}
        onChange={(event) => { setSearchTerm(event.target.value); }} />
        { matches.length > 0 && 
          <Typography>{(matches.length == MAX_RESULTS) ? `${MAX_RESULTS}+` : matches.length} results</Typography>
        }
        <div>
          { matches.map((match) => (
            <EventDetail key={ `event-${match.item.id}`} venue={venueMap[match.item.venue]} event={match.item} showDate={true} />
          ))}
        </div>
    </Box>
  )
}

export default Search;