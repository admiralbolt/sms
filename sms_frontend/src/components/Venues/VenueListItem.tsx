import { Venue } from "@/types";
import { Box, Link, IconButton } from "@mui/material";
import {
  Delete,
  Edit,
  Link as LinkIcon,
  Place as PlaceIcon,
} from "@mui/icons-material";

interface Props {
  venue: Venue;
}

export const VenueListItem = ({ venue }: Props) => {

  const displayImage = () => {
    return venue.venue_image ?? "/placeholder.png";
  };

  const mapsLink = (venue: Venue) => {
    return `https://www.google.com/maps/search/?api=1&query=${venue.name}  ${venue.address} ${venue.city} ${venue.postal_code}`;
  };

  return (
    <div className="flex md:flex-row" key={`venue-list-item-${venue.id}`}>
      <Box
        className={`bg-center flex flex-col justify-start text-center relative`}
        sx={{
          backgroundImage: `url(${displayImage})`,
          minWidth: "100px",
          minHeight: "100px",
          maxWidth: "100px",
          maxHeight: "100px",
          backgroundSize: "cover", // Ensure background image covers the box
          backgroundPosition: "center",
        }}
      >
        <div className="z-0 absolute bg-black w-full h-full opacity-20" />
        <div className="flex flex-col z-index-10 bg-black/50"></div>
      </Box>
      <div className="flex-col max-w-[70vw] min-width-[400px] content-center">
        <Box className="flex items-center">
          <div className="flex flex-col justify-center align-center content-center px-4">
            <Link target="_blank" href={mapsLink(venue)}>
              <IconButton
                disabled={!mapsLink(venue)}
                size="small"
                edge="start"
                color="primary"
                aria-label="menu"
              >
                <PlaceIcon fontSize={"small"} />
              </IconButton>
            </Link>
            {venue?.venue_url && (
              <Link target="_blank" href={venue.venue_url}>
                <IconButton
                  size="small"
                  edge="start"
                  color="info"
                  aria-label="menu"
                >
                  <LinkIcon />
                </IconButton>
              </Link>
            )}
          </div>
          <Box className="flex flex-col">
            <Link href={`/venues/${venue.slug}`}>
              <h2 className="text-lg lg:text-xl text-wrap font-bold">
                {venue.name}
              </h2>
            </Link>

            <Box className="flex">
              <span className="text-xs font-bold">
                {venue.address}
              </span>
            </Box>
          </Box>
        </Box>
      </div>
    </div>
  );
};