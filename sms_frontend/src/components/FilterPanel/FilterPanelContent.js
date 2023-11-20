import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useEvents, useVenues } from '../../hooks/api';
import FormGroup from '@mui/material/FormGroup';
import { LocalStorageContext } from '../../contexts/LocalStorageContext';
import { useContext } from 'react';
import { LocalStorageContextProvider } from '../../contexts/LocalStorageContext';


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
    <Box sx={{ overflow: 'auto' }}>
      <Typography>Date</Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker onChange={(newValue) => setSelectedDate(newValue)} defaultValue={selectedDate} />
      </LocalizationProvider>

      <Typography>Event Types</Typography>
      <FormGroup id="event-type-filters">
        {eventTypes.map((type) => (
          <FormControlLabel key={type} control={<Checkbox checked={selectedEventTypes.includes(type)} value={type} onChange={updateEventFilters} />} label={type} />
        ))}
      </FormGroup>

      <Typography>Venue Types</Typography>
      <FormGroup id="venue-type-filters">
        {venueTypes.map((type) => (
          <FormControlLabel key={type} control={<Checkbox checked={selectedVenueTypes.includes(type)} value={type} onChange={updateVenueFilters} />} label={type} />
        ))}
      </FormGroup>



      {/* <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List> */}
    </Box>
    </>
  );
}

export default FilterPanelContent;