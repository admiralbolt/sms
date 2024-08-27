import { Venue } from "@/types";

import { VenueCard } from "./VenueCard";

import { useIsAuthenticated } from "@/hooks/auth";

import { useContext, useState } from "react";

import {
  Delete,
  Edit,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
} from "@mui/material";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import customAxios from "@/hooks/customAxios";

import { VenueForm } from "./VenueForm";
import { useNavigate } from "react-router-dom";

interface Props {
  venue: Venue;
}

export const VenueDetail = ({ venue }: Props) => {
  const [isAuthenticated, _] = useIsAuthenticated();
  console.log(`AUTH?: ${isAuthenticated}`);
  const [edit, setEdit] = useState<boolean>(false);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const { setSnackbar } = useContext(SnackbarContext) || {};
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
          message: `Venue: ${venue.name} deleted. Navigating to /venues`
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
    return (
      <VenueForm
        venue={venue}
        setEdit={setEdit}
      />
    );
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
        <VenueCard venue={venue} />
      </>
    );
  }
};
