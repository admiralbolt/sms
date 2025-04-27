import { EditNote, WatchLater } from "@mui/icons-material";
import { Box, Link, Typography } from "@mui/material";

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
      className={`flex w-full md:w-[600px] lg:w-[900px] sm:w-[600px rounded-sm align-center p-2 content-center border-b-2 border-blue-500/20`}
    >
      <div className="flex md:flex-row">
        <Link href={`/open-mics/${openMic.slug}`}>
          <Box
            className={`bg-center flex flex-col justify-start text-center relative min-w-[80px] w-[80px] min-h-[80px] h-[80px] sm:w-[100px] sm:h-[100px]`}
            sx={{
              backgroundImage: `url(${openMic.venue.venue_image})`,
              backgroundSize: "cover", // Ensure background image covers the box
              backgroundPosition: "center",
            }}
          >
            <div className="z-0 absolute bg-black w-full h-full opacity-20" />
            <div className="flex flex-col z-index-10 bg-black/50"></div>
          </Box>
        </Link>

        <div className="flex-col content-center px-4">
          <Box className="flex items-center">
            <Box className="flex flex-col">
              <Typography
                sx={{ fontSize: "1.05rem", textWrap: 1, fontWeight: "bold" }}
              >
                {openMic.name}
              </Typography>

              <Box className="flex">
                <Link
                  sx={{ fontSize: "0.85em" }}
                  target="_blank"
                  href={mapsLink(openMic.venue)}
                >
                  {openMic.venue.address}
                </Link>
              </Box>

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
