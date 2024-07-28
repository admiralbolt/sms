import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import {
  Autocomplete,
  AutocompleteChangeReason,
  Box,
  Button,
  CircularProgress,
  Divider,
  TextField,
} from "@mui/material";

import { getEventById } from "@/hooks/api";
import customAxios from "@/hooks/customAxios";
import { Event } from "@/types";

import { EventCard } from "./EventCard";

export const EventPanel = () => {
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [open, setOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [isNew, setIsNew] = useState<boolean>(false);
  const [keyword] = useDebounce(inputValue, 500);

  const handleChange = (
    _event: React.SyntheticEvent<Element, globalThis.Event>,
    value: Event | null,
    _reason: AutocompleteChangeReason,
  ) => {
    setIsNew(false);
    setSelectedEvent(value == null ? null : value);
  };

  useEffect(() => {
    if (!open) {
      setResults([]);
    }
  }, [open]);

  const search = () => {
    if (keyword.length == 0) return;

    customAxios
      .get("api/event_search", {
        params: {
          keyword: keyword,
          include_hidden: true,
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

  const createEvent = () => {
    setIsNew(true);
    setSelectedEvent({} as Event);
  };

  const reloadData = (id?: number) => {
    (async () => {
      setSelectedEvent(await getEventById(id));
    })();
  };

  const onDelete = (_id: number) => {
    if (selectedEvent == null) return;

    setSelectedEvent(null);
    setInputValue("");
  };

  const onCreate = (id: number) => {
    if (selectedEvent == null) return;

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
          sx={{ width: 300 }}
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          isOptionEqualToValue={(option: Event, value: Event) =>
            option.id === value.id
          }
          getOptionLabel={(option: Event) =>
            `${option.title} (${option.event_day})`
          }
          options={results}
          loading={loading}
          onChange={handleChange}
          value={selectedEvent}
          inputValue={inputValue}
          onInputChange={(_, val: string) => {
            setInputValue(val);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Events"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <Button
          sx={{ marginLeft: "1em", height: "3em" }}
          variant="contained"
          onClick={createEvent}
        >
          Create New
        </Button>
      </Box>
      <Box width="100%" height="2em" />
      <Divider />
      {selectedEvent != null && (
        <EventCard
          event={selectedEvent}
          showActions={true}
          isNew={isNew}
          deleteCallback={onDelete}
          createCallback={onCreate}
          updateCallback={onUpdate}
        />
      )}
    </Box>
  );
};
