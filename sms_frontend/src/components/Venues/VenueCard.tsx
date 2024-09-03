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
  );
};
