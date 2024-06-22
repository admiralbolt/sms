import { Box, Divider, Typography } from "@mui/material";

import { IngestionRun, changeTypes } from "@/types";

import { ChangeTypeChip } from "./ChangeTypeChip";

interface Props {
  ingestionRun: IngestionRun;
}

export const IngestionRunSummaryTable = ({ ingestionRun }: Props) => {
  // We map api -> change type -> val.
  const s: any = {};
  const totals: any = {};
  changeTypes.forEach((t) => {
    totals[t] = 0;
  });

  ingestionRun.summary.forEach((record) => {
    if (!(record.api_name in s)) {
      s[record.api_name] = {};
    }
    s[record.api_name][record.change_type] = record.total;
    totals[record.change_type] += record.total;
  });

  const sortedApiNames = Object.keys(s);
  sortedApiNames.sort();

  return (
    <Box>
      <Typography sx={{fontSize: "1.2em", fontWeight: "bold"}}>Summary</Typography>
      <Box sx={{ display: "flex", alignItems: "start", flexDirection: "row"}}>
        {changeTypes.map((t) => (
          <Box key={`change-type-${t}`} sx={{ marginRight: "0.5em"}}>
            <ChangeTypeChip changeType={t} value={totals[t]} />
          </Box>
        ))}
      </Box>
      <Divider sx={{marginTop: "0.5em", marginBottom: "0.25em"}} />
      <Box sx={{ display: "flex", alignItems: "start", flexDirection: "row", overflowX: "scroll"}}>
        {sortedApiNames.map((api_name) => (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "start", maxWidth: "150px", marginRight: "1em"}} key={`api-name-${api_name}`}>
            <Typography sx={{maxWidth: "140px"}} noWrap>{api_name}</Typography>
            {changeTypes.map((t) => (
              <Box
                sx={{ display: "flex", alignItems: "center", flexDirection: "row", marginBottom: "0.4em" }}
                key={`ingestion-record-${api_name}-${t}`}
              >
                <ChangeTypeChip changeType={t} value={s[api_name][t]} />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
