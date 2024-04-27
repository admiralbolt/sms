import { useState } from "react";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useVenues } from "@/hooks/api";

import { Venue } from "@/types";

interface Props {
  venueId: string;
  onChange: (event: SelectChangeEvent) => void;
}

export const VenueSelect = ({ onChange, venueId }: Props) => {
  const [venues] = useVenues();

  const [selectedVenue, setSelectedVenue] = useState<string>(venueId);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedVenue(event.target.value);
    onChange(event);
  };

  return (
    <Select onChange={handleChange} value={selectedVenue}>
      {venues.map((venue: Venue) => (
        <MenuItem key={venue.id} value={venue.id}>
          {venue.name}
        </MenuItem>
      ))}
    </Select>
  );
};
