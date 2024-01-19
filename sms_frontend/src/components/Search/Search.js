import { Box, Divider } from '@mui/material';
import EventDetail from '../EventList/EventDetail';
import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import { useEvents, useVenueMap } from '../../hooks/api';
import Fuse from 'fuse.js';

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
    if (matchList.length <= 50) {
      console.log(matchList);
      setMatches(matchList);
    }
  }, [fuse, searchTerm]);

  return (
    <Box>
      <TextField id="search-input" label="Search!" variant="outlined" fullWidth={true} value={searchTerm}
        onChange={(event) => { setSearchTerm(event.target.value); }} />
        <div>
          { matches.map((match) => (
            <EventDetail key={ `event-${match.item.id}`} venue={venueMap[match.item.venue]} event={match.item} />
          ))}
        </div>
    </Box>
  )
}

export default Search;