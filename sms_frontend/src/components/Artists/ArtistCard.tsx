import { useContext, useState } from "react";

import {
  Delete,
  Edit,
  GpsFixed as GpsFixedIcon,
  Home as HomeIcon,
  LocationCity as LocationCityIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardMedia,
  Dialog,
  DialogActions,
  DialogTitle,
  Link,
  Typography,
} from "@mui/material";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import customAxios from "@/hooks/customAxios";
import { Artist } from "@/types";

import { ArtistForm } from "./ArtistForm";

interface Props {
  artist: Artist;
  isNew?: boolean;
  deleteCallback?: any;
  createCallback?: any;
  updateCallback?: any;
}

export const ArtistCard = ({
  artist,
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

  const deleteArtist = () => {
    customAxios.delete(`api/artists/${artist.id}`).then(
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
    if (artist.artist_image) return artist.artist_image;

    return "/placeholder.png";
  };

  if (edit) {
    return (
      <ArtistForm
        artist={artist}
        setEdit={setEdit}
        isNew={isNew}
        createCallback={createCallback}
        updateCallback={updateCallback}
      />
    );
  } else {
    return (
      <Box key={artist.id}>
        <Card
          key={artist.id}
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
              {artist.name}
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
                <Typography sx={{ marginLeft: "0.5em" }}>
                  {artist.bio}
                </Typography>
              </Box>

              {artist.social_links.map((link) => (
                <Link target="_blank" rel="noopener" href={link.url}>{link.platform}</Link>
              ))}
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
          <DialogTitle>Delete Artist: {artist.name}</DialogTitle>
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
            <Button variant="contained" onClick={deleteArtist} autoFocus>
              DELETE IT
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
};

ArtistCard.defaultProps = {
  isNew: false,
};
