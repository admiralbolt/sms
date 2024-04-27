import { EventCard } from "@/components";

import { useCallback, useEffect, useState } from "react";
import { Event } from "@/types";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  TextField,
  debounce,
} from "@mui/material";

import customAxios from "@/hooks/customAxios";
import { getEventById } from "@/hooks/api";

export const EventPanel = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [isNew, setIsNew] = useState<boolean>(false);

  const loading = open && options.length === 0;

  const handleChange = (_event: React.SyntheticEvent, value: Event | null) => {
    setIsNew(false);
    setSelectedEvent(value == null ? null : value);
  };

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  const search = useCallback(
    debounce((keyword) => {
      if (keyword.length == 0) return;

      customAxios
        .get("api/event_search", {
          params: {
            keyword: keyword,
          },
        })
        .then((response) => {
          setOptions(response.data);
        });
    }, 300),
    []
  );

  useEffect(() => {
    search(inputValue);
  }, [inputValue]);

  const createEvent = () => {
    setIsNew(true);
    setSelectedEvent({} as Event);
  };

  const reloadData = (id?: string) => {
    (async () => {
      setSelectedEvent(await getEventById(id || ""));
    })();
  };

  const onDelete = (_id?: string) => {
    if (selectedEvent == null) return;
    console.log({ _id });

    setSelectedEvent(null);
    setInputValue("");
  };

  const onCreate = (id?: string) => {
    if (selectedEvent == null) return;

    reloadData(id);
  };

  const onUpdate = (id?: string) => {
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
          options={options}
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
