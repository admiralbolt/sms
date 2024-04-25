import { useState } from "react";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useVenues } from "@/hooks/api";

interface Props {
  venueId: string
  onChange: any
}

const VenueSelect = ({ onChange, venueId }: Props) => {
  const venues = useVenues();

  const [selectedVenue, setSelectedVenue] = useState<string>(venueId);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedVenue(event.target.value);
    onChange(event);
  }

  return (
    <Select onChange={handleChange} value={selectedVenue}>
      {venues.map((venue) => (
        <MenuItem key={venue.id} value={venue.id}>{venue.name}</MenuItem>
      ))}
    </Select>
  );
};


export default VenueSelect;