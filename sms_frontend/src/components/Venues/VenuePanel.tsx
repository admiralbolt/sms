import { useVenues } from "@/hooks/api";
import VenueCard from "./VenueCard";

import { useState } from "react";
import { Venue } from "@/types";
import { Autocomplete, AutocompleteChangeReason, Box, Button, Divider, TextField } from "@mui/material";

import customAxios from "@/hooks/customAxios";

const VenuePanel = () => {
  const [venues, setVenues] = useVenues();

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [isNew, setIsNew] = useState<boolean>(false);

  const handleChange = (event: any, value: Venue | null, reason: AutocompleteChangeReason, details: any | undefined) => {
    setIsNew(false);
    setSelectedVenue((value == null) ? null : value);
  }

  const createVenue = () => {
    setIsNew(true);
    setSelectedVenue({} as Venue);
  }

  const reloadData = (id?: number) => {
    customAxios.get("api/venues").then((res) => {
      setVenues(res.data);
      const v = res.data.find((o: any) => o.id == id);
      if (v != undefined) {
        setSelectedVenue(v);
      }
    });
  }

  const onDelete = () => {
    if (selectedVenue == null) return;
    
    reloadData();
    setSelectedVenue(null);
    setInputValue("");
  }

  const onCreate = (id: number) => {
    if (selectedVenue == null) return;

    reloadData(id);
  }

  const onUpdate = (id: number) => {
    reloadData(id);
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center"
        }}
       >
        <Autocomplete
          options={venues}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Venue" />}
          getOptionLabel={(mic: Venue) => {return mic.name}}
          onChange={handleChange}
          value={selectedVenue}
          inputValue={inputValue}
          onInputChange={(_, val: string) => {
            setInputValue(val);
          }}
        />
        <Button sx={{marginLeft: "1em", height: "3em"}} variant="contained" onClick={createVenue}>Create New</Button>
      </Box>
      <Box width="100%" height="2em" />
      <Divider />
      {(selectedVenue != null) &&
        <VenueCard venue={selectedVenue} isNew={isNew} deleteCallback={onDelete} createCallback={onCreate} updateCallback={onUpdate} />
      }
    </Box>
  );
};

export default VenuePanel;