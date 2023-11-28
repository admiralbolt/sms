import { Box, Card, CardMedia, Link, Typography } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import LinkIcon from '@mui/icons-material/Link';
import IconButton from '@mui/material/IconButton';
import { useState, useEffect } from 'react';

import { useIsMobile, useWindowDimensions } from '../../hooks/window';

const EventDetail = ({ venue, event}) => {

  const { height, width } = useWindowDimensions();
  const isMobile = useIsMobile();

  const [cardWidth, setCardWidth] = useState(576);

  useEffect(() => {
    if (isMobile) {
      setCardWidth(width * 0.91);
    } else {
      setCardWidth(576);
    }
  }, [isMobile, width]);

  const mapsLink = (venue) => {
    return `https://www.google.com/maps/search/?api=1&query=${venue.name}  ${venue.address} ${venue.city} ${venue.postal_code}`;
  }

  const formatTime = (t) => {
    return new Date('1970-01-01T' + t + 'Z').toLocaleTimeString('en-US',
      {timeZone:'UTC', hour12:true, hour:'numeric', minute:'numeric'}
    );
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

  return (
    <Card key={event.id} sx={{ display: 'flex', flexDirection: 'column', margin: 1, padding: 1.5, maxWidth: 'sm' }}>
      <Box position="relative">
        <CardMedia
          component="img"
          image={displayImage()}
          sx={{ filter: "brightness(65%)", width: cardWidth, height: cardWidth / 2 }}
        />
        <Typography sx={{ width: "100%", top: 0, position: "absolute", fontWeight: "bold", fontSize: "1rem", zIndex: 10, textAlign: "center"}}>{event.title}</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'center' }}>
          <Typography>{formatTime(event.start_time)}</Typography>
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