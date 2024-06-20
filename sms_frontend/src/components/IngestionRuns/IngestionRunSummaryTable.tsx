import { Box, Grid, Typography } from "@mui/material";

import { IngestionRun, changeTypes } from "@/types";

import { ChangeTypeChip } from "./ChangeTypeChip";

interface Props {
  ingestionRun: IngestionRun;
}

export const IngestionRunSummaryTable = ({ ingestionRun }: Props) => {
  const s: any = {};
  changeTypes.forEach((t: string) => {
    s[t] = 0;
    s[t] = 0;
  });

  ingestionRun.summary.forEach((record) => {
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
