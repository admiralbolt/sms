import { getVenueById } from "@/hooks/api";
import { useEffect, useState } from "react";
import { Venue } from "@/types";
import { Box, Button, Card, CardMedia, Typography } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

import { format24HourTime } from "@/utils/dateUtils";

import WatchLaterIcon from "@mui/icons-material/WatchLater";
import PunchClockIcon from "@mui/icons-material/PunchClock";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CategoryIcon from "@mui/icons-material/Category";

import { OpenMic } from "@/types";

import OpenMicForm from "./OpenMicForm";

interface Props {
  openMic: OpenMic;
}

const OpenMicCard = ({ openMic }: Props) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [venue, setVenue] = useState<Venue>({} as Venue);

  useEffect(() => {
    if (openMic.venue < 0) return;

    (async() => {
      setVenue(await getVenueById(openMic.venue));
    })();
  }, [openMic.venue]);

  const toggleEdit = () => {
    setEdit(!edit);
  }

  const deleteMic = () => {

  }

  const displayImage = () => {
    if (venue.venue_image) return venue.venue_image;

    return "/placeholder.png";
  };

  if (edit) {
    return (
      <OpenMicForm openMic={openMic} setEdit={setEdit} />
    );
  } else {
    return (
      <Card key={openMic.id}
        sx={{
          margin: "1em",
          padding: "1.5em",
          width: "800px",
          maxWidth: "96vw",
        }}
      >
        <Box position="relative">
          <CardMedia
            component="img"
            image={displayImage()}
            sx={{ filter: "brightness(35%)", width: "sm", aspectRatio: 2 }}
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
            {openMic.name}
          </Typography>
          {/* INFO ON LEFT SIDE */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              padding: "0.2em",
              display: "flex",
              alignItems: "start",
              justifyContent: "center",
              flexDirection: "column"
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justContent: "start",
                flexDirection: "row",
                marginBottom: "0.5em"
              }}
            >
              <PunchClockIcon sx={{ verticalAlign: "middle" }} />
              <Typography sx={{ marginLeft: "0.5em" }}>{openMic.cadence_readable}</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justContent: "start",
                flexDirection: "row",
                marginBottom: "0.5em"
              }}
            >
              <EditNoteIcon sx={{ verticalAlign: "middle" }} />
              <Typography sx={{ marginLeft: "0.5em" }}>{format24HourTime(openMic.signup_start_time)}</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justContent: "start",
                flexDirection: "row",
                marginBottom: "0.5em"
              }}
            >
              <WatchLaterIcon sx={{ verticalAlign: "middle" }} />
              <Typography sx={{ marginLeft: "0.5em" }}>{format24HourTime(openMic.event_start_time)}</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justContent: "start",
                flexDirection: "row",
                marginBottom: "0.5em"
              }}
            >
              <CategoryIcon sx={{ verticalAlign: "middle" }} />
              <Typography sx={{ marginLeft: "0.5em" }}>{openMic.open_mic_type}</Typography>
            </Box>
          </Box>

          {/* ACTION BUTTONS */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              padding: "0.2em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20
            }}
          >
            <Button variant="contained" onClick={toggleEdit}><Edit /></Button>
            <Button sx={{ marginLeft: "1em" }} variant="contained" color="error" onClick={deleteMic}><Delete /></Button>
          </Box>
        </Box>
      </Card>
    );
  }
};

export default OpenMicCard;