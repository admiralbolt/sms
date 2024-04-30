import { Box, Grid, Typography } from "@mui/material";

import { IngestionRun, changeTypes } from "@/types";

interface Props {
  ingestionRun: IngestionRun;
}

const IngestionRunSummaryTable = ({ ingestionRun }: Props) => {
  const s: any = { event: {}, venue: {} };
  changeTypes.forEach((t: string) => {
    s["event"][t] = 0;
    s["venue"][t] = 0;
  });

  ingestionRun.summary.forEach((record) => {
    s[record.field_changed][record.change_type] += record.total;
  });

  return (
    <Box>
      <Typography>Summary View</Typography>
      <Grid container>
        <Grid textAlign="center" border="1px solid white" item xs={6}>
          Events
        </Grid>
        <Grid textAlign="center" border="1px solid white" item xs={6}>
          Venues
        </Grid>

        <Box width="100%" />
        {changeTypes.map((t) => (
          <Grid
            key={`event-${t}`}
            padding="1em"
            border="1px solid white"
            item
            xs={1}
          >
            <Typography>{t}</Typography>
          </Grid>
        ))}
        {changeTypes.map((t) => (
          <Grid
            key={`venue-${t}`}
            padding="1em"
            border="1px solid white"
            borderRight="1px solid white"
            item
            xs={1}
          >
            <Typography>{t}</Typography>
          </Grid>
        ))}
        {changeTypes.map((t) => (
          <Grid
            key={`event-val-${t}`}
            padding="1em"
            border="1px solid white"
            item
            xs={1}
          >
            <Typography>{s["event"][t]}</Typography>
          </Grid>
        ))}
        {changeTypes.map((t) => (
          <Grid
            key={`venue-val-${t}`}
            padding="1em"
            border="1px solid white"
            borderRight="1px solid white"
            item
            xs={1}
          >
            <Typography>{s["venue"][t]}</Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default IngestionRunSummaryTable;
