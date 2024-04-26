import { IngestionRun } from "@/types"

import { Box, Button } from "@mui/material";
import IngestionRunSummaryTable from "./IngestionRunSummaryTable";
import { formatDateTime } from "@/utils/dateUtils";
import IngestionRunFull from "./IngestionRunFull";

import { useState } from "react";

interface Props {
  run: IngestionRun;
}

const IngestionRun = ({ run }: Props) => {
  const [showFullDetails, setShowFullDetails] = useState<boolean>(false);

  return (
    <Box key={run.id}>
      <Box>
        <h2>Run Name: {run.name}</h2>
        <h3>Run At: {formatDateTime(run.created_at)}</h3>
        <h4>Id: {run.id}</h4>
        <Button onClick={() => setShowFullDetails(!showFullDetails)}>Toggle Details</Button>
        {showFullDetails && (
          <IngestionRunFull run={run} />
        )}
        {!showFullDetails && (
          <IngestionRunSummaryTable ingestionRun={run} />
        )}
      </Box>
      <Box height="3em" width="100%" />
    </Box>
  );
};

export default IngestionRun;