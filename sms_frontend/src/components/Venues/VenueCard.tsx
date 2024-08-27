
import {
  GpsFixed as GpsFixedIcon,
  Home as HomeIcon,
  LocationCity as LocationCityIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardMedia,
  Typography,
} from "@mui/material";

import { Venue } from "@/types";

interface Props {
  venue: Venue;
}

export const VenueCard = ({
  venue,
}: Props) => {
  const displayImage = () => {
    if (venue.venue_image) return venue.venue_image;

    return "/placeholder.png";
  };

  return (
    <Box key={venue.id}>
      <Card
        key={venue.id}
        sx={{
          margin: "1em",
          padding: "1.5em",
          width: "800px",
          maxWidth: "96vw",
        }}
      >
        <Box position="relative">
          <CardMedia
            component="img"
            image={displayImage()}
            sx={{
              filter: "brightness(35%)",
              width: "sm",
              aspectRatio: 2,
            }}
          />
          <Typography
            sx={{
              width: "100%",
              top: 0,
              position: "absolute",
              fontWeight: "bold",
              fontSize: "1rem",
              zIndex: 10,
              textAlign: "center",
            }}
          >
            {venue.name}
          </Typography>
          {/* INFO ON LEFT SIDE */}
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
                {venue.address}
              </Typography>
            </Box>
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
              <Typography sx={{ marginLeft: "0.5em" }}>
                {venue.city}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justContent: "start",
                flexDirection: "row",
                marginBottom: "0.5em",
              }}
            >
              <GpsFixedIcon sx={{ verticalAlign: "middle" }} />
              <Typography sx={{ marginLeft: "0.5em" }}>
                Lat: {venue.latitude}, Long: {venue.longitude}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};