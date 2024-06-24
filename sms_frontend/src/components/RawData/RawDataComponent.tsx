import { Box, Typography } from "@mui/material";

import { RawData } from "@/types";

interface Props {
  rawData: RawData;
}

export const RawDataComponent = ({ rawData }: Props) => {
  return (
    <Box>
      <Typography fontWeight="bold">Raw Data ID: {rawData.id}</Typography>
      <Typography>Event Name: {rawData.event_name}</Typography>
      <Typography>Venue Name: {rawData.venue_name}</Typography>
      <pre style={{ fontSize: "0.8em" }}>
        {JSON.stringify(rawData.data, null, 2)}
      </pre>
    </Box>
  );
};
