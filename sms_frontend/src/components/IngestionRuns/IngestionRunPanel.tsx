import { Box } from '@mui/material';

import { useIngestionRuns } from '@/hooks/api';

import IngestionRunView from './IngestionRunView';

const IngestionRunPanel = () => {
  const runs = useIngestionRuns();

  return (
    <Box>
      {runs.map((run) => (
        <IngestionRunView key={run.id} run={run} />
      ))}
    </Box>
  );
};

export default IngestionRunPanel;
