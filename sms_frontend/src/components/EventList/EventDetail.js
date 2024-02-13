import { Box, Card, CardMedia, Link, Typography } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import LinkIcon from '@mui/icons-material/Link';
import IconButton from '@mui/material/IconButton';
import dayjs from 'dayjs';
import MicIcon from '@mui/icons-material/Mic';
import { PiMicrophoneStageFill } from 'react-icons/pi';
import { FaGuitar } from "react-icons/fa6";

const SHOW_COLOR = '#0070ff';
const OPEN_JAM_COLOR = '#ff5500';
const OPEN_MIC_COLOR = '#ee6600';


const EventDetail = ({ venue, event, showDate = false }) => {
  
  const mapsLink = (venue) => {
    return `https://www.google.com/maps/search/?api=1&query=${venue.name}  ${venue.address} ${venue.city} ${venue.postal_code}`;
  }

  const formatTime = (t) => {
    return new Date('1970-01-01T' + t + 'Z').toLocaleTimeString('en-US',
      {timeZone:'UTC', hour12:true, hour:'numeric', minute:'numeric'}
    );
  }

  const formatDay = (day) => {
    return dayjs(day).format('ddd, MMM. D');
  }

  const timeAndDate = (event) => {
    if (showDate) {
      return `${formatTime(event.start_time)} - ${formatDay(event.event_day)}`;
    }
    
    return formatTime(event.start_time);
  }

  const displayImage = () => {
    if (event.event_image) return event.event_image;
    if (venue.venue_image) return venue.venue_image;

    return `${process.env.PUBLIC_URL}/placeholder.png`
  }

  const venueLink = () => {
    if (venue.venue_url == null || venue.venue_url == undefined || venue.venue_url.length == 0) return venue.name;

    return (
      <Link target="_blank" href={venue.venue_url}>{venue.name}</Link>
    )
  }

  const getEventIcon = (event_type) => {
    event_type = (event_type != undefined) ? event_type.toLowerCase() : "";
    if (event_type == "open mic" || event_type == "open jam") {
      return (<PiMicrophoneStageFill size={24} color={(event_type == "open jam") ? OPEN_JAM_COLOR : OPEN_MIC_COLOR} />);
    }
      
    return (<FaGuitar size={24} color={SHOW_COLOR} />);
  }

  return (
    <Card key={event.id} sx={{ display: 'flex', flexDirection: 'column', margin: 1, padding: 1.5, width: '600px', maxWidth: '600px' }}>
      <Box position="relative">
        <CardMedia
          component="img"
          alt={`Poster for ${event.title}`}
          image={displayImage()}
          sx={{ filter: "brightness(65%)", width: 'sm', aspectRatio: 2}}
        />
        <Typography sx={{ width: "100%", top: 0, position: "absolute", fontWeight: "bold", fontSize: "1rem", zIndex: 10, textAlign: "center"}}>{event.title}</Typography>
        <Box sx={{ position: "absolute", left: 0, bottom: 0, padding: "0.2em", opacity: 0.4, backgroundColor: "black", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {getEventIcon(event.event_type)}
        </Box>
        <Box sx={{ position: "absolute", left: 0, bottom: 0, padding: "0.2em", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {getEventIcon(event.event_type)}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'center' }}>
          <Typography>{timeAndDate(event)}</Typography>
          <Typography>{venueLink()}</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'end', flex: 1, marginTop: 1}}>
          <Link target="_blank" href={mapsLink(venue)}>
            <IconButton
              size="large"
              edge="start"
              color="primary"
              aria-label="menu"
              sx={{ mr: 3, ml: -.5 }}
            >
              <PlaceIcon />
            </IconButton>
          </Link>
          <Link target="_blank" href={(event.event_url == null || event.event_url.length == 0) ? null : event.event_url}>
            <IconButton
              disabled={(event.event_url == null || event.event_url.length == 0)}
              size="large"
              edge="start"
              color="primary"
              aria-label="menu"
              sx={{ mr: 3 }}
            >
              <LinkIcon />
            </IconButton>
          </Link>
        </Box>
      </Box>
    </Card>
  )
}

export default EventDetail;