import { getVenueById } from "@/hooks/api";
import { useEffect, useState } from "react";
import { Venue } from "@/types";
import { Box, Button, Card, CardMedia, Typography } from "@mui/material";
import { Edit } from "@mui/icons-material";

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
          width: "600px",
          maxWidth: "96vw",
        }}
      >
        <Box position="relative">
          <CardMedia
            component="img"
            image={displayImage()}
            sx={{ filter: "brightness(65%)", width: "sm", aspectRatio: 2 }}
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
            <Button onClick={toggleEdit}><Edit /></Button>
          </Box>
        </Box>
      </Card>
    );
  }
};

export default OpenMicCard;