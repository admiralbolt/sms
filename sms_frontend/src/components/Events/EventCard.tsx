import dayjs from "dayjs";
import { useContext, useEffect, useMemo, useState } from "react";

import {
  Delete,
  Edit,
  Link as LinkIcon,
  Place as PlaceIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Link,
} from "@mui/material";

import { FaGuitar } from "react-icons/fa6";
import { PiMicrophoneStageFill } from "react-icons/pi";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import { getVenueById } from "@/hooks/api";
import customAxios from "@/hooks/customAxios";
import { Event, EventType, Venue } from "@/types";

import { EventForm } from "./EventForm";

const SHOW_COLOR = "#0070ff";
const OPEN_JAM_COLOR = "#ff5500";
const OPEN_MIC_COLOR = "#ee6600";

interface Props {
  event: Event;
  showDate?: boolean;
  isNew?: boolean;
  showActions?: boolean;
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
  createCallback = emptyCallback,
  updateCallback = emptyCallback,
  deleteCallback = emptyCallback,
}: Props) => {
  const [venue, setVenue] = useState<Venue>({} as Venue);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const { setSnackbar } = useContext(SnackbarContext);

  useEffect(() => {
    if (event.venue < 0) return;

    (async () => {
      setVenue(await getVenueById(event.venue));
    })();
  }, [event.venue]);

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

  const getEventIcon = (event_type: EventType) => {
    const lowercaseEventType =
      event_type != undefined ? event_type.toLowerCase() : "";
    if (lowercaseEventType == "open mic" || lowercaseEventType == "open jam") {
      return (
        <PiMicrophoneStageFill
          size={24}
          color={
            lowercaseEventType == "open jam" ? OPEN_JAM_COLOR : OPEN_MIC_COLOR
          }
        />
      );
    }

    return <FaGuitar size={24} color={SHOW_COLOR} />;
  };

  const displayImage = useMemo(() => {
    if (event.event_image) return event.event_image;
    if (venue.venue_image) return venue.venue_image;

    return "/placeholder.png";
  }, [event.event_image, venue.venue_image]);

  const venueLink = () => {
    if (
      venue.venue_url == null ||
      venue.venue_url == undefined ||
      venue.venue_url.length == 0
    )
      return venue.name;

    return (
      <Link target="_blank" href={venue.venue_url}>
        {venue.name}
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
        className="flex  align-center content-center justify-center"
      >
        <div
          className="flex md:flex-row"
          key={event.id}
          style={{
            display: "flex",
            margin: 1,
            padding: 1.5,
          }}
        >
          <Box
            className={`w-24 h-24 md:w-44 md:h-44 bg-cover bg-center flex flex-col justify-end text-center md:text-right relative`}
            sx={{ backgroundImage: `url(${displayImage})` }}
          >
            <div className="z-0 absolute bg-black w-full h-full opacity-20" />
            <div className="flex flex-col z-index-10 p-4 bg-black/50">
              <span className="text-xs md:text-xl">{venueLink()}</span>
              <span className="text-xs md:text-lg fond-bold">
                {timeAndDate(event)}
              </span>
            </div>
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: 0,
              bottom: 0,
              padding: "0.2em",
              opacity: 0.4,
              backgroundColor: "black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {getEventIcon(event.event_type)}
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

          <div className="p-4 md:w-[600px]">
            <h2 className="md:text-3xl text-wrap">{event.title}</h2>
            <h3>{venue.address}</h3>
            <Box sx={{ display: "flex", flexDirection: "row", mt: 1 }}>
              <Link target="_blank" href={mapsLink(venue)}>
                <IconButton
                  size="large"
                  edge="start"
                  color="primary"
                  aria-label="menu"
                  sx={{ mr: 3, ml: -0.5 }}
                >
                  <PlaceIcon />
                </IconButton>
              </Link>
              <Link target="_blank" href={event.event_url || ""}>
                <IconButton
                  disabled={!event.event_url}
                  size="large"
                  edge="start"
                  color="primary"
                  aria-label="menu"
                  sx={{ mr: 3 }}
                >
                  <LinkIcon />
                </IconButton>
              </Link>
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
