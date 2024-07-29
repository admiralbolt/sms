import { Venue } from "@/types";
import { Box } from "@mui/material";

interface Props {
  venue: Venue;
}

export const VenueListItem = ({ venue }: Props) => {
  return (
    <Box>
      {venue.id} - {venue.name}
    </Box>
  );
};