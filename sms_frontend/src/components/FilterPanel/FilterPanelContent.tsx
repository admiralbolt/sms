import dayjs from "dayjs";
import { useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Button, Checkbox, FormControlLabel } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormGroup from "@mui/material/FormGroup";
import Typography from "@mui/material/Typography";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { LocalStorageContext } from "@/contexts/LocalStorageContext";
import {
  useEventTypes, // useVenueTypes
} from "@/hooks/api";
import { useAppBarHeight } from "@/hooks/materialHacks";

export const FilterPanelContent = () => {
  const eventTypes = useEventTypes();
  // const venueTypes = useVenueTypes();
  const appBarHeight = useAppBarHeight();
  const {
    selectedEventTypes,
    setSelectedEventTypes,
    // selectedVenueTypes,
    // setSelectedVenueTypes,
    selectedDate,
    setSelectedDate,
  } = useContext(LocalStorageContext) || {};
  const [filterPanelDate, setFilterPanelDate] = useState(selectedDate);
  const [searchParams, setSearchParams] = useSearchParams();

  const EVENT_TYPES_KEY = "eventTypes";
  const DATE_KEY = "date";

  const getEventTypesFromURL = useCallback(() => {
    const params = searchParams.get(EVENT_TYPES_KEY);
    return params ? params.split(",") : [];
  }, [searchParams]);

  const getDateFromURL = useCallback(() => {
    const date = searchParams.get(DATE_KEY);
    return date ? date : undefined;
  }, [searchParams]);

  useEffect(() => {
    const initialEventTypes = getEventTypesFromURL();
    if (initialEventTypes.length > 0) {
      setSelectedEventTypes?.(initialEventTypes);
    } else {
      setSelectedEventTypes?.([]);
    }
  }, [getEventTypesFromURL, setSelectedEventTypes]); // Only re-run the effect if the URL changes

  useEffect(() => {
    const date = getDateFromURL();
    if (
      date != undefined &&
      selectedDate != undefined &&
      selectedDate.format("YYYY-MM-DD") != date
    ) {
      setSelectedDate?.(dayjs(date));
    }
  }, []); // We only want to run this once on page load.

  useEffect(() => {
    setFilterPanelDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (!eventTypes.length) {
      return;
    }

    if (
      selectedEventTypes?.length &&
      !eventTypes.every((type) => selectedEventTypes.includes(type))
    ) {
      setSearchParams((searchParams) => {
        searchParams.set(EVENT_TYPES_KEY, selectedEventTypes.join(","));
        return searchParams;
      });
    } else {
      setSearchParams((searchParams) => {
        searchParams.delete(EVENT_TYPES_KEY);
        return searchParams;
      });
    }
  }, [eventTypes, selectedEventTypes, setSearchParams]);

  useEffect(() => {
    if (selectedDate != undefined) {
      setSearchParams((searchParams) => {
        searchParams.set(DATE_KEY, selectedDate.format("YYYY-MM-DD"));
        return searchParams;
      });
    }
  }, [selectedDate, searchParams, setSearchParams]);

  const updateEventFilters = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (
      event.target.checked &&
      !selectedEventTypes?.includes(event.target.value)
    ) {
      setSelectedEventTypes?.([
        ...(selectedEventTypes || []),
        event.target.value,
      ]);
    } else if (
      !event.target.checked &&
      selectedEventTypes?.includes(event.target.value)
    ) {
      setSelectedEventTypes?.(
        selectedEventTypes?.filter((t) => t != event.target.value),
      );
    }
  };

  // const updateVenueFilters = (event) => {
  //   if (
  //     event.target.checked &&
  //     !selectedVenueTypes.includes(event.target.value)
  //   ) {
  //     setSelectedVenueTypes([...selectedVenueTypes, event.target.value]);
  //   } else if (
  //     !event.target.checked &&
  //     selectedVenueTypes.includes(event.target.value)
  //   ) {
  //     setSelectedVenueTypes(
  //       selectedVenueTypes.filter((t) => t != event.target.value)
  //     );
  //   }
  // };

  return (
    <>
      <Box
        sx={{
          overflow: "auto",
          padding: 1,
          marginTop: `${appBarHeight}px`,
        }}
      >
        <Typography>Date</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            onChange={(newValue) => newValue && setSelectedDate?.(newValue)}
            defaultValue={filterPanelDate}
            value={filterPanelDate}
          />
        </LocalizationProvider>

        <Typography sx={{ marginTop: 1 }}>Event Types</Typography>
        <Divider />
        <FormGroup id="event-type-filters">
          {eventTypes.map((type) => (
            <div key={type} className="flex flex-row">
              <FormControlLabel
                className="w-52"
                control={
                  <Checkbox
                    checked={selectedEventTypes?.includes(type)}
                    value={type}
                    onChange={updateEventFilters}
                  />
                }
                label={type}
              />
              <Button onClick={() => setSelectedEventTypes?.([type])}>
                Only
              </Button>
            </div>
          ))}
        </FormGroup>

        {/* <Typography sx={{ marginTop: 1 }}>Venue Types</Typography>
      <Divider />
      <FormGroup id="venue-type-filters">
        {venueTypes.map((type) => (
          <FormControlLabel key={type} control={<Checkbox checked={selectedVenueTypes.includes(type)} value={type} onChange={updateVenueFilters} />} label={type} />
        ))}
      </FormGroup> */}
      </Box>
    </>
  );
};
