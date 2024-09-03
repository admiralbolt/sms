import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Delete, Edit } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogTitle, Typography } from "@mui/material";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import { useIsAuthenticated } from "@/hooks/auth";
import customAxios from "@/hooks/customAxios";
import { Venue } from "@/types";

import { VenueCard, VenueForm } from "@/components/Venues";
import { useAppBarHeight } from "@/hooks/materialHacks";

interface Props {
  venue: Venue;
}

export const VenueDetail = ({ venue }: Props) => {
  const [isAuthenticated, _] = useIsAuthenticated();
  const [edit, setEdit] = useState<boolean>(false);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const { setSnackbar } = useContext(SnackbarContext) || {};
  const appBarHeight = useAppBarHeight();
  const navigate = useNavigate();

  const toggleEdit = () => {
    setEdit(!edit);
  };

  const deleteVenue = () => {
    customAxios.delete(`api/venues/${venue.slug}`).then(
      (_res) => {
        setSnackbar({
          open: true,
          severity: "success",
          message: `Venue: ${venue.name} deleted. Navigating to /venues`,
        });
        setTimeout(() => {
          navigate("/venues");
        }, 2000);
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

  if (edit) {
    return <VenueForm venue={venue} setEdit={setEdit} />;
  } else {
    return (
      <>
        {isAuthenticated && (
          <Box>
            {/* ACTION BUTTONS */}
            <Box
              sx={{
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
        )}

        {venue.venue_image != undefined && (
          <Box sx={{filter: "brightness(20%);", position: "fixed", top: 0, zIndex: 9000, width: "100vw", height: "100vh"}}>
            <img style={{maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0)", objectFit: "cover", width: "100vw"}}  src={venue.venue_image} />
          </Box>
        )}

        {venue.venue_image != undefined && (
          <Box sx={{filter: "brightness(20%);", position: "fixed", top: 0, zIndex: 9100, width: "100vw", height: `${appBarHeight}px`, overflow: "hidden"}}>
            <img style={{objectFit: "cover", width: "100vw"}}  src={venue.venue_image} />
          </Box>
        )}

        <Box sx={{position: "relative", zIndex: 9001, padding: "0.6rem", display: "flex", alignItems: "start", flexDirection: "column"}} key={venue.id}>
          <VenueCard venue={venue} />
        </Box>
      </>
    );
  }
};
