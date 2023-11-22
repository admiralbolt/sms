import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useEvents, useVenues } from '../../hooks/api';
import FormGroup from '@mui/material/FormGroup';
import { LocalStorageContext } from '../../contexts/LocalStorageContext';
import { useContext } from 'react';


const FilterPanelContent = () => {
  const [eventsByVenue, eventsByDate, eventTypes] = useEvents();
  const [venues, venueTypes] = useVenues();
  const { selectedEventTypes, setSelectedEventTypes, selectedVenueTypes, setSelectedVenueTypes, selectedDate, setSelectedDate } = useContext(LocalStorageContext);

  const updateEventFilters = (event) => {
    if (event.target.checked && !selectedEventTypes.includes(event.target.value)) {
      setSelectedEventTypes([...selectedEventTypes, event.target.value]);
    } else if (!event.target.checked && selectedEventTypes.includes(event.target.value)) {
      setSelectedEventTypes(selectedEventTypes.filter(t => t != event.target.value));
    }
  }

  const updateVenueFilters = (event) => {
    if (event.target.checked && !selectedVenueTypes.includes(event.target.value)) {
      setSelectedVenueTypes([...selectedVenueTypes, event.target.value]);
    } else if (!event.target.checked && selectedVenueTypes.includes(event.target.value)) {
      setSelectedVenueTypes(selectedVenueTypes.filter(t => t != event.target.value));
    }
  }

  return (
    <>
    <Toolbar />
    <Box sx={{ overflow: 'auto', padding: 1 }}>
      <Typography>Date</Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker onChange={(newValue) => setSelectedDate(newValue)} defaultValue={selectedDate} />
      </LocalizationProvider>

      <Typography sx={{ marginTop: 1 }}>Event Types</Typography>
      <Divider />
      <FormGroup id="event-type-filters">
        {eventTypes.map((type) => (
          <FormControlLabel key={type} control={<Checkbox checked={selectedEventTypes.includes(type)} value={type} onChange={updateEventFilters} />} label={type} />
        ))}
      </FormGroup>

      <Typography sx={{ marginTop: 1 }}>Venue Types</Typography>
      <Divider />
      <FormGroup id="venue-type-filters">
        {venueTypes.map((type) => (
          <FormControlLabel key={type} control={<Checkbox checked={selectedVenueTypes.includes(type)} value={type} onChange={updateVenueFilters} />} label={type} />
        ))}
      </FormGroup>
    </Box>
    </>
  );
}

export default FilterPanelContent;