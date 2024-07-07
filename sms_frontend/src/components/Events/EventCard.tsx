import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";

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
  CardMedia,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Link,
  Typography,
} from "@mui/material";

import { FaGuitar } from "react-icons/fa6";
import { PiMicrophoneStageFill } from "react-icons/pi";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import { getEventDisplayImage } from "@/hooks/api";
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

  const venueLink = () => {
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
      <Box key={event.id}>
        <Card
          key={event.id}
          sx={{
            display: "flex",
            flexDirection: "column",
            margin: 1,
            padding: 1.5,
            width: "600px",
            maxWidth: "96vw",
          }}
        >
          <Box position="relative">
            <CardMedia
              component="img"
              alt={`Poster for ${event.title}`}
              image={getEventDisplayImage(event)}
              sx={{
                filter: "brightness(65%)",
                width: "sm",
                aspectRatio: 2,
              }}
            />
            <Typography
              sx={{
                width: "100%",
                top: 0,
                position: "absolute",
                fontWeight: "bold",
                fontSize: "1rem",
                zIndex: 10,
                textAlign: "center",
              }}
            >
              {event.title}
            </Typography>
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
            <Box
              sx={{
                position: "absolute",
                left: 0,
                bottom: 0,
                padding: "0.2em",
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
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", mt: 1 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                justifyContent: "center",
              }}
            >
              <Typography>{timeAndDate(event)}</Typography>
              <Typography>{venueLink()}</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "end",
                flex: 1,
                marginTop: 1,
              }}
            >
              <Link target="_blank" href={mapsLink(event.venue)}>
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
          </Box>
        </Card>

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
