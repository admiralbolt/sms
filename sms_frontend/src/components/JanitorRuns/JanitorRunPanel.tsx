import { Box } from "@mui/material";

import { useJanitorRuns } from "@/hooks/api";

import { JanitorRunView } from "./JanitorRunView";

export const JanitorRunPanel = () => {
  const runs = useJanitorRuns();

  return (
    <Box>
      {runs.map((run) => (
        <JanitorRunView key={run.id} run={run} />
      ))}
    </Box>
  );
};
