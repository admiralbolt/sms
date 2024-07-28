import { Box, Divider, Typography } from "@mui/material";

import { JanitorRun } from "@/types";

interface Props {
  run: JanitorRun;
}

export const JanitorRunSummaryTable = ({ run }: Props) => {
  return (
    <Box>
      <Typography sx={{ fontSize: "1.2em", fontWeight: "bold" }}>
        Summary
      </Typography>
      <Divider sx={{ marginTop: "0.5em", marginBottom: "0.25em" }} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          maxWidth: "150px",
          marginRight: "1em",
        }}
      >
        {run.summary.map((summaryRecord) => (
          <Typography
            key={summaryRecord.operation}
            sx={{ maxWidth: "140px" }}
            noWrap
          >
            {summaryRecord.operation} : {summaryRecord.total}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};
