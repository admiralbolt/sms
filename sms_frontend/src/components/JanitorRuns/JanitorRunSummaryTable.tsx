import { Box, Grid, Typography } from "@mui/material";

import { JanitorRun, changeTypes } from "@/types";

import { ChangeTypeChip } from "@/components/IngestionRuns/ChangeTypeChip";

interface Props {
  JanitorRun: JanitorRun;
}

export const JanitorRunSummaryTable = ({ JanitorRun }: Props) => {
  const s: any = {};
  changeTypes.forEach((t: string) => {
    s[t] = 0;
    s[t] = 0;
  });

  JanitorRun.summary.forEach((record) => {
    s[record.change_type] += record.total;
  });

  return (
    <Box>
      <Typography>Summary</Typography>
      <Box width="100%" />
      {changeTypes.map((t) => (
        <Box
          sx={{ display: "flex", alignItems: "center", marginBottom: "0.4em" }}
          key={`ingestion-record-${t}`}
        >
          <ChangeTypeChip changeType={t} />
          <Typography sx={{ marginLeft: "1em" }}>{s[t]}</Typography>
        </Box>
      ))}
    </Box>
  );
};
