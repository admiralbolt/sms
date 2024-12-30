import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Delete, Edit } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogTitle } from "@mui/material";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import { useIsAuthenticated } from "@/hooks/auth";
import customAxios from "@/hooks/customAxios";
import { OpenMic } from "@/types";

import { OpenMicCard } from "./OpenMicCard";
import { OpenMicForm } from "./OpenMicForm";

interface Props {
  openMic: OpenMic;
}

export const OpenMicDetail = ({ openMic }: Props) => {
  const [isAuthenticated, _] = useIsAuthenticated();
  console.log(`AUTH?: ${isAuthenticated}`);
  const [edit, setEdit] = useState<boolean>(false);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const { setSnackbar } = useContext(SnackbarContext) || {};
  const navigate = useNavigate();

  const toggleEdit = () => {
    setEdit(!edit);
  };

  const deleteOpenMic = () => {
    customAxios.delete(`api/openMics/${openMic.slug}`).then(
      (_res) => {
        setSnackbar({
          open: true,
          severity: "success",
          message: `OpenMic: ${openMic.name} deleted. Navigating to /openMics`,
        });
        setTimeout(() => {
          navigate("/openMics");
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
    return <OpenMicForm openMic={openMic} setEdit={setEdit} />;
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
              <DialogTitle>Delete OpenMic: {openMic.name}</DialogTitle>
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
                <Button variant="contained" onClick={deleteOpenMic} autoFocus>
                  DELETE IT
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
        <OpenMicCard openMic={openMic} />
      </>
    );
  }
};
