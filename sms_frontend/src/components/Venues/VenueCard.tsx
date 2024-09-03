import {
  GpsFixed as GpsFixedIcon,
  Home as HomeIcon,
  LocationCity as LocationCityIcon,
  Place as PlaceIcon,
  Public as PublicIcon,
} from "@mui/icons-material";
import { Box, Card, CardMedia, Link, Typography } from "@mui/material";

import { Venue } from "@/types";

interface Props {
  venue: Venue;
}

export const VenueCard = ({ venue }: Props) => {
  const displayImage = () => {
    if (venue.venue_image) return venue.venue_image;

    return "/placeholder.png";
  };

  const mapsLink = (venue: Venue) => {
    return `https://www.google.com/maps/search/?api=1&query=${venue.name}  ${venue.address} ${venue.city} ${venue.postal_code}`;
  }

  return (
    <Box key={venue.id}>
      <Card
        key={venue.id}
        sx={{
          width: "800px",
          maxWidth: "100vw",
        }}
      >
        <Box position="relative">
          <CardMedia
            component="img"
            image={displayImage()}
            sx={{
              filter: "brightness(25%)",
              width: "sm",
              aspectRatio: 2,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              padding: "0.2em",
              display: "flex",
              alignItems: "start",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "1.8rem",
                zIndex: 10,
                marginBottom: "0.8rem"
              }}
            >
              {venue.name}
            </Typography>
            <Link target="_blank" href={mapsLink(venue)}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justContent: "start",
                  flexDirection: "row",
                  marginBottom: "0.5em",
                }}
              >
                  <PlaceIcon sx={{ verticalAlign: "middle" }} />
                  <Typography sx={{ marginLeft: "0.5em" }}>
                    {venue.address}
                  </Typography>
              </Box>
            </Link>

            {venue.venue_url != null && (
              <Link target="_blank" href={venue.venue_url}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justContent: "start",
                    flexDirection: "row",
                    marginBottom: "0.5em",
                  }}
                >
                  <PublicIcon sx={{ verticalAlign: "middle" }} />
                  <Typography sx={{ marginLeft: "0.5em" }}>
                    {venue.venue_url}
                  </Typography>
                </Box>
              </Link>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justContent: "start",
                flexDirection: "row",
                marginBottom: "0.5em",
              }}
            >
              <LocationCityIcon sx={{ verticalAlign: "middle" }} />
              <Typography sx={{ marginLeft: "0.5em" }}>{venue.city}</Typography>
            </Box>

            {venue.neighborhood != null && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justContent: "start",
                  flexDirection: "row",
                  marginBottom: "0.5em",
                }}
              >
                <HomeIcon sx={{ verticalAlign: "middle" }} />
                <Typography sx={{ marginLeft: "0.5em" }}>
                  {venue.neighborhood}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};
