import { Box } from '@mui/material';

import { useIngestionRuns } from '@/hooks/api';

import IngestionRun from './IngestionRun';

const IngestionRunPanel = () => {
  const runs = useIngestionRuns();

  return (
    <Box>
      {runs.map((run) => (
        <IngestionRun key={run.id} run={run} />
      ))}
    </Box>
  );
};

export default IngestionRunPanel;
