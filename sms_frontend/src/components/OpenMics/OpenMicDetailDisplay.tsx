import {
  Category,
  EditNote,
  PunchClock,
  WatchLater,
} from "@mui/icons-material";
import DirectionsIcon from "@mui/icons-material/Directions";
import LanguageIcon from "@mui/icons-material/Language";
import { Box, Link, Typography } from "@mui/material";

import { OpenMic } from "@/types";
import { format24HourTime } from "@/utils/dateUtils";
import { formatDomain, mapsLink } from "@/utils/misc";

interface Props {
  openMic: OpenMic;
  isNew?: boolean;
}

export const OpenMicDetailDisplay = ({ openMic, isNew }: Props) => {
  const displayImage = () => {
    return openMic.venue.venue_image ?? "/placeholder.png";
  };

  return (
    <Box key={openMic.id} className={`flex flex-col`}>
      <Box className={`flex mb-3`}>
        <Typography sx={{ fontSize: "1.4rem", fontWeight: "bold" }}>
          {openMic.name}
        </Typography>
      </Box>
      <Box className={`flex flex-row mb-1`}>
        <Box className={`flex mr-2`}>
          <DirectionsIcon />
        </Box>
        <Box className={`flex`}>
          <Link target="_blank" href={mapsLink(openMic.venue)}>
            {openMic.venue.address}
          </Link>
        </Box>
      </Box>
      {openMic.venue.venue_url && (
        <Box className={`flex flex-row mb-1`}>
          <Box className={`flex mr-2`}>
            <LanguageIcon />
          </Box>
          <Box className={`flex`}>
            <Link target="_blank" href={openMic.venue.venue_url}>
              {formatDomain(openMic.venue.venue_url)}
            </Link>
          </Box>
        </Box>
      )}
      <Box className={`flex flex-row mb-1`}>
        <Box className={`flex mr-2`}>
          <EditNote />
        </Box>
        <Box className={`flex`}>
          <Typography>{format24HourTime(openMic.signup_start_time)}</Typography>
        </Box>
      </Box>
      <Box className={`flex flex-row mb-1`}>
        <Box className={`flex mr-2`}>
          <WatchLater />
        </Box>
        <Box className={`flex`}>
          <Typography>{format24HourTime(openMic.event_start_time)}</Typography>
        </Box>
      </Box>

      <Box className={`flex flex-row mb-3`}></Box>

      <Box className={`flex flex-row`}>
        <Typography sx={{ whiteSpace: "pre-wrap" }}>
          {openMic.description}
        </Typography>
      </Box>
    </Box>
  );
};

OpenMicDetailDisplay.defaultProps = {
  isNew: false,
};
