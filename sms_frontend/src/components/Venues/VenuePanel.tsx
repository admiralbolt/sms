import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import {
  Autocomplete,
  AutocompleteChangeReason,
  Box,
  Button,
  Divider,
  TextField,
} from "@mui/material";

import { getVenueById } from "@/hooks/api";
import customAxios from "@/hooks/customAxios";
import { Venue } from "@/types";

import { VenueCard } from "./VenueCard";

export const VenuePanel = () => {
  const [results, setResults] = useState<Venue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [open, setOpen] = useState<boolean>(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [isNew, setIsNew] = useState<boolean>(false);
  const [keyword] = useDebounce(inputValue, 500);

  const handleChange = (
    _event: any,
    value: Venue | null,
    _reason: AutocompleteChangeReason,
    _details: any | undefined,
  ) => {
    setIsNew(false);
    setSelectedVenue(value == null ? null : value);
  };

  useEffect(() => {
    if (!open) {
      setResults([]);
    }
  }, [open]);

  const search = () => {
    if (keyword.length == 0) return;

    customAxios
      .get("api/venue_search", {
        params: {
          keyword: keyword,
        },
      })
      .then((response) => {
        setResults(response.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    search();
  }, [keyword]);

  const createVenue = () => {
    setIsNew(true);
    setSelectedVenue({} as Venue);
  };

  const reloadData = (id?: number) => {
    (async () => {
      setSelectedVenue(await getVenueById(id));
    })();
  };

  const onDelete = () => {
    if (selectedVenue == null) return;

    reloadData();
    setSelectedVenue(null);
    setInputValue("");
  };

  const onCreate = (id: number) => {
    if (selectedVenue == null) return;

    reloadData(id);
  };

  const onUpdate = (id: number) => {
    reloadData(id);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Autocomplete
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          options={results}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Venue" />}
          getOptionLabel={(venue: Venue) => {
            return venue.name;
          }}
          loading={loading}
          onChange={handleChange}
          value={selectedVenue}
          inputValue={inputValue}
          onInputChange={(_, val: string) => {
            setInputValue(val);
          }}
        />
        <Button
          sx={{ marginLeft: "1em", height: "3em" }}
          variant="contained"
          onClick={createVenue}
        >
          Create New
        </Button>
      </Box>
      <Box width="100%" height="2em" />
      <Divider />
      {selectedVenue != null && (
        <VenueCard
          venue={selectedVenue}
          isNew={isNew}
          deleteCallback={onDelete}
          createCallback={onCreate}
          updateCallback={onUpdate}
        />
      )}
    </Box>
  );
};
