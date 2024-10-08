import dayjs from "dayjs";
import { useContext, useState } from "react";

import {
  Delete,
  Edit,
  Link as LinkIcon,
  Place as PlaceIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Link,
} from "@mui/material";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import { getEventDisplayImage } from "@/hooks/api";
import customAxios from "@/hooks/customAxios";
import { Event, Venue } from "@/types";

import { EventForm } from "./EventForm";

interface Props {
  event: Event;
  showDate?: boolean;
  isNew?: boolean;
  showActions?: boolean;
  size?: "small" | "large";
  deleteCallback?: (id: number) => void;
  createCallback?: (id: number) => void;
  updateCallback?: (id: number) => void;
}

const emptyCallback = (_id: number) => {
  return;
};

export const EventCard = ({
  event,
  showActions = false,
  showDate = false,
  isNew = false,
  size = "large",
  createCallback = emptyCallback,
  updateCallback = emptyCallback,
  deleteCallback = emptyCallback,
}: Props) => {
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const { setSnackbar } = useContext(SnackbarContext);

  const toggleEdit = () => {
    setEdit(!edit);
  };

  const deleteEvent = () => {
    customAxios.delete(`api/events/${event.id}`).then(
      (_res) => {
        deleteCallback(event.id);
      },
      (error) => {
        setSnackbar({
          open: true,
          severity: "error",
          message: error.message,
        });
      },
    );

    setOpenConfirmation(false);
  };

  const mapsLink = (venue: Venue) => {
    return `https://www.google.com/maps/search/?api=1&query=${venue.name}  ${venue.address} ${venue.city} ${venue.postal_code}`;
  };

  const formatTime = (t: string) => {
    return new Date("1970-01-01T" + t + "Z").toLocaleTimeString("en-US", {
      timeZone: "UTC",
      hour12: true,
      hour: "numeric",
      minute: "numeric",
    });
  };

  const formatDay = (day: string) => {
    return dayjs(day).format("ddd, MMM. D");
  };

  const timeAndDate = (event: Event) => {
    if (showDate) {
      return `${formatTime(event.start_time)} - ${formatDay(event.event_day)}`;
    }

    return formatTime(event.start_time);
  };

  const displayImage = getEventDisplayImage(event);
  const getVenueLink = () => {
    if (
      event.venue.venue_url == null ||
      event.venue.venue_url == undefined ||
      event.venue.venue_url.length == 0
    )
      return event.venue.name;

    return (
      <Link target="_blank" href={event.venue.venue_url}>
        {event.venue.name}
      </Link>
    );
  };

  if (edit) {
    return (
      <EventForm
        event={event}
        setEdit={setEdit}
        isNew={isNew}
        createCallback={createCallback}
        updateCallback={updateCallback}
      />
    );
  } else {
    return (
      <Box
        key={event.id}
        className={`flex w-[400px] sm:w-[600px] ${size === "large" ? "md:w-[600px] lg:w-[900px]" : ""} rounded-sm align-center p-2 content-center border-b-2 border-blue-500/20`}
      >
        <div className="flex md:flex-row" key={event.id}>
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

          {/* ACTION BUTTONS */}
          {showActions && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                padding: "0.2em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100000,
              }}
            >
              <Button variant="contained" onClick={toggleEdit}>
                <Edit />
              </Button>
              <Button
                sx={{ marginLeft: "1em" }}
                variant="contained"
                color="error"
                onClick={() => {
                  setOpenConfirmation(true);
                }}
              >
                <Delete />
              </Button>
            </Box>
          )}

          <div className="flex-col max-w-[70vw] min-width-[400px] content-center">
            <Box className="flex items-center">
              <div className="flex flex-col justify-center align-center content-center px-4">
                <Link target="_blank" href={mapsLink(event.venue)}>
                  <IconButton
                    disabled={!mapsLink(event.venue)}
                    size="small"
                    edge="start"
                    color="primary"
                    aria-label="menu"
                  >
                    <PlaceIcon fontSize={"small"} />
                  </IconButton>
                </Link>
                {event.event_url && (
                  <Link target="_blank" href={event.event_url}>
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
                <h2 className="text-lg lg:text-xl text-wrap font-bold">
                  {event.title}
                </h2>

                <Box className="flex items-center">
                  <span className="text-md text-wrap pr-2 font-medium">
                    {getVenueLink()}
                  </span>
                </Box>
                <Box className="flex">
                  <span className="text-sm">{timeAndDate(event)}</span>
                </Box>
                <Box className="flex">
                  <span className="text-xs font-bold">
                    {event.venue.address}
                  </span>
                </Box>
              </Box>
            </Box>
          </div>
        </div>

        <Dialog
          open={openConfirmation}
          onClose={() => {
            setOpenConfirmation(false);
          }}
        >
          <DialogTitle>
            Delete Event: {event.title} ({event.event_day})
          </DialogTitle>
          <DialogActions>
            <Button
              color="secondary"
              variant="outlined"
              onClick={() => {
                setOpenConfirmation(false);
              }}
            >
              Don't do it
            </Button>
            <Button variant="contained" onClick={deleteEvent} autoFocus>
              DELETE IT
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
};
