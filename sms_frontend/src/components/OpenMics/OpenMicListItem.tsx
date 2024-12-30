import {
  EditNote,
  Link as LinkIcon,
  Place as PlaceIcon,
  WatchLater,
} from "@mui/icons-material";
import { Box, IconButton, Link, Typography } from "@mui/material";

import { OpenMic } from "@/types";
import { format24HourTime } from "@/utils/dateUtils";
import { mapsLink } from "@/utils/misc";

interface Props {
  openMic: OpenMic;
}

export const OpenMicListItem = ({ openMic }: Props) => {
  return (
    <Box
      key={openMic.id}
      className={`flex w-[400px] md:w-[600px] lg:w-[900px] sm:w-[600px rounded-sm align-center p-2 content-center border-b-2 border-blue-500/20`}
    >
      <div className="flex md:flex-row">
        <Box
          className={`bg-center flex flex-col justify-start text-center relative`}
          sx={{
            backgroundImage: `url(${openMic.venue.venue_image})`,
            minWidth: "100px",
            minHeight: "100px",
            maxWidth: "100px",
            maxHeight: "100px",
            backgroundSize: "cover", // Ensure background image covers the box
            backgroundPosition: "center",
          }}
        >
          <div className="z-0 absolute bg-black w-full h-full opacity-20" />
          <div className="flex flex-col z-index-10 bg-black/50"></div>
        </Box>

        <div className="flex-col max-w-[70vw] min-width-[400px] content-center">
          <Box className="flex items-center">
            <div className="flex flex-col justify-center align-center content-center px-4">
              <Link target="_blank" href={mapsLink(openMic.venue)}>
                <IconButton
                  disabled={!mapsLink(openMic.venue)}
                  size="small"
                  edge="start"
                  color="primary"
                  aria-label="menu"
                >
                  <PlaceIcon fontSize={"small"} />
                </IconButton>
              </Link>
              {openMic.venue.venue_url && (
                <Link target="_blank" href={openMic.venue.venue_url}>
                  <IconButton
                    size="small"
                    edge="start"
                    color="info"
                    aria-label="menu"
                  >
                    <LinkIcon />
                  </IconButton>
                </Link>
              )}
            </div>
            <Box className="flex flex-col">
              <h2 className="text-lg lg:text-xl text-wrap font-bold">
                {openMic.name}
              </h2>

              <Box className="flex">
                <EditNote sx={{ verticalAlign: "middle" }} />
                <Typography sx={{ marginLeft: "0.5em" }}>
                  {format24HourTime(openMic.signup_start_time)}
                </Typography>
              </Box>
              <Box className="flex">
                <WatchLater sx={{ verticalAlign: "middle" }} />
                <Typography sx={{ marginLeft: "0.5em" }}>
                  {format24HourTime(openMic.event_start_time)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </div>
      </div>
    </Box>
  );
};
