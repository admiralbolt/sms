import { useContext, useState } from "react";

import { Delete, Edit } from "@mui/icons-material";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import HomeIcon from "@mui/icons-material/Home";
import LocationCityIcon from "@mui/icons-material/LocationCity";
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
import customAxios from "@/hooks/customAxios";
import { Venue } from "@/types";

import VenueForm from "./VenueForm";

interface Props {
  venue: Venue;
  isNew?: boolean;
  deleteCallback?: any;
  createCallback?: any;
  updateCallback?: any;
}

const VenueCard = ({
  venue,
  isNew,
  deleteCallback,
  createCallback,
  updateCallback,
}: Props) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const { setSnackbar } = useContext(SnackbarContext) || {};

  const toggleEdit = () => {
    setEdit(!edit);
  };

  const deleteVenue = () => {
    customAxios.delete(`api/venues/${venue.id}`).then(
      (_res) => {
        deleteCallback();
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
      <VenueForm
        venue={venue}
        setEdit={setEdit}
        isNew={isNew}
        createCallback={createCallback}
        updateCallback={updateCallback}
      />
    );
  } else {
    return (
      <Box key={venue.id}>
        <Card
          key={venue.id}
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
              {venue.name}
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
                <HomeIcon sx={{ verticalAlign: "middle" }} />
                <Typography sx={{ marginLeft: "0.5em" }}>
                  {venue.address}
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
                <LocationCityIcon sx={{ verticalAlign: "middle" }} />
                <Typography sx={{ marginLeft: "0.5em" }}>
                  {venue.city}
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
                <GpsFixedIcon sx={{ verticalAlign: "middle" }} />
                <Typography sx={{ marginLeft: "0.5em" }}>
                  Lat: {venue.latitude}, Long: {venue.longitude}
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
          <DialogTitle>Delete Venue: {venue.name}</DialogTitle>
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
            <Button variant="contained" onClick={deleteVenue} autoFocus>
              DELETE IT
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
};

VenueCard.defaultProps = {
  isNew: false,
};

export default VenueCard;
