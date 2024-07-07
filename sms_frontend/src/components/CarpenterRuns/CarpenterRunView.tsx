import { useState } from "react";

import { Box, Button } from "@mui/material";

import { CarpenterRun } from "@/types";
import { formatDateTime } from "@/utils/dateUtils";

import { CarpenterRunFull } from "./CarpenterRunFull";
import { CarpenterRunSummaryTable } from "./CarpenterRunSummaryTable";

interface Props {
  run: CarpenterRun;
}

export const CarpenterRunView = ({ run }: Props) => {
  const [showFullDetails, setShowFullDetails] = useState<boolean>(false);

  return (
    <Box key={run.id}>
      <Box>
        <h2>Run Name: {run.name}</h2>
        <h3>Run At: {formatDateTime(run.created_at)}</h3>
        <h4>Id: {run.id}</h4>
        <Button onClick={() => setShowFullDetails(!showFullDetails)}>
          Toggle Details
        </Button>
        {showFullDetails && <CarpenterRunFull run={run} />}
        {!showFullDetails && <CarpenterRunSummaryTable run={run} />}
      </Box>
      <Box height="3em" width="100%" />
    </Box>
  );
};