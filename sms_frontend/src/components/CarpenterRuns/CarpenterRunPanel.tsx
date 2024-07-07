import { Box } from "@mui/material";

import { useCarpenterRuns } from "@/hooks/api";

import { CarpenterRunView } from "./CarpenterRunView";

export const CarpenterRunPanel = () => {
  const runs = useCarpenterRuns();

  return (
    <Box>
      {runs.map((run) => (
        <CarpenterRunView key={run.id} run={run} />
      ))}
    </Box>
  );
};
