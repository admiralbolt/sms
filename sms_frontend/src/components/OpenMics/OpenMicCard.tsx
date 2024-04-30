import { useContext, useEffect, useState } from "react";

import { Category, Delete, Edit, EditNote, PunchClock, WatchLater } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardMedia,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
} from "@mui/material";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import { getVenueById } from "@/hooks/api";
import customAxios from "@/hooks/customAxios";
import { Venue } from "@/types";
import { OpenMic } from "@/types";
import { format24HourTime } from "@/utils/dateUtils";

import OpenMicForm from "./OpenMicForm";

interface Props {
  openMic: OpenMic;
  isNew?: boolean;
  deleteCallback?: (id: number) => void;
  createCallback?: (id: number) => void;
}

const emptyCallback = (_id: number) => {
  return;
};

const OpenMicCard = ({
  openMic,
  isNew,
  deleteCallback = emptyCallback,
  createCallback = emptyCallback,
}: Props) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [venue, setVenue] = useState<Venue>({} as Venue);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const { setSnackbar } = useContext(SnackbarContext) || {};

  useEffect(() => {
    if (openMic.venue < 0) return;

    (async () => {
      setVenue(await getVenueById(openMic.venue));
    })();
  }, [openMic.venue]);

  const toggleEdit = () => {
    setEdit(!edit);
  };

  const deleteMic = () => {
    customAxios.delete(`api/open_mics/${openMic.id}`).then(
      (_res) => {
        deleteCallback(openMic.id);
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

  const displayImage = () => {
    if (venue.venue_image) return venue.venue_image;

    return "/placeholder.png";
  };

  if (edit) {
    return (
      <OpenMicForm
        openMic={openMic}
        setEdit={setEdit}
        isNew={isNew}
        createCallback={createCallback}
      />
    );
  } else {
    return (
      <Box key={openMic.id}>
        <Card
          key={openMic.id}
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
              sx={{
                filter: "brightness(35%)",
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
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justContent: "start",
                  flexDirection: "row",
                  marginBottom: "0.5em",
                }}
              >
                <PunchClock sx={{ verticalAlign: "middle" }} />
                <Typography sx={{ marginLeft: "0.5em" }}>
                  {openMic.cadence_readable}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justContent: "start",
                  flexDirection: "row",
                  marginBottom: "0.5em",
                }}
              >
                <EditNote sx={{ verticalAlign: "middle" }} />
                <Typography sx={{ marginLeft: "0.5em" }}>
                  {format24HourTime(openMic.signup_start_time)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justContent: "start",
                  flexDirection: "row",
                  marginBottom: "0.5em",
                }}
              >
                <WatchLater sx={{ verticalAlign: "middle" }} />
                <Typography sx={{ marginLeft: "0.5em" }}>
                  {format24HourTime(openMic.event_start_time)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justContent: "start",
                  flexDirection: "row",
                  marginBottom: "0.5em",
                }}
              >
                <Category sx={{ verticalAlign: "middle" }} />
                <Typography sx={{ marginLeft: "0.5em" }}>
                  {openMic.open_mic_type}
                </Typography>
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
                zIndex: 20,
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
          </Box>
        </Card>

        <Dialog
          open={openConfirmation}
          onClose={() => {
            setOpenConfirmation(false);
          }}
        >
          <DialogTitle>Delete Open Mic: {openMic.name}</DialogTitle>
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
            <Button variant="contained" onClick={deleteMic} autoFocus>
              DELETE IT
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
};

OpenMicCard.defaultProps = {
  isNew: false,
};

export default OpenMicCard;
