import dayjs from 'dayjs';

import { Box, Card, Divider, Typography } from '@mui/material';

import { usePeriodicTasks } from '@/hooks/api';

const PeriodicTaskStatus = () => {
  const tasks = usePeriodicTasks();

  const formatDate = (day: Date): string => {
    return dayjs(day).format('MMMM D, YYYY HH:mm');
  };

  // Want to see periodic tasks at a glance!
  const statusColor = (healthy: boolean): string => {
    return healthy ? '#50bbff' : 'red';
  };

  return (
    <Box>
      {tasks.map((task) => (
        <Card sx={{ marginBottom: '1em', padding: '0.5em' }} key={task.id}>
          <Typography variant="h5">{task.name}</Typography>
          <Divider />
          <Typography color={statusColor(task.enabled)}>
            Enabled: {`${task.enabled}`}
          </Typography>
          <Typography color={statusColor(task.healthy)}>
            Last Run: {formatDate(task.last_run_at)}
          </Typography>
          <Typography color="text.secondary" fontSize="0.8rem">
            Last Run Full Time: {`${task.last_run_at}`}
          </Typography>
          <Typography color="text.secondary" fontSize="0.8rem">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Expected Run:{' '}
            {`${task.crontab.healthy_last_run}`}
          </Typography>
          <Typography color="text.secondary" fontSize="0.8rem">
            Total Run Count: {task.total_run_count}
          </Typography>
        </Card>
      ))}
    </Box>
  );
};

export default PeriodicTaskStatus;
