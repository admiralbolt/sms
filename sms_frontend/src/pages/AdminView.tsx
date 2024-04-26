import { useIsAuthenticated } from "@/hooks/auth";

import * as React from 'react';

import { Box, Tab, Tabs } from "@mui/material";
import IngestionRunPanel from "@/components/IngestionRuns/IngestionRunPanel";
import PeriodicTaskStatus from "@/components/PeriodicTaskStatus";
import OpenMicPanel from "@/components/OpenMics/OpenMicPanel";
import VenuePanel from "@/components/Venues/VenuePanel";
import EventPanel from "@/components/Events/EventPanel";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const AdminView = () => {
  const [isAuthenticated] = useIsAuthenticated();

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Status" {...a11yProps(0)} />
          <Tab label="Ingestion Runs" {...a11yProps(1)} />
          <Tab label="Commands" {...a11yProps(2)} />
          <Tab label="Venues" {...a11yProps(3)} />
          <Tab label="Open Mics" {...a11yProps(4)} />
          <Tab label="Events" {...a11yProps(5)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <PeriodicTaskStatus />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <IngestionRunPanel />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Commands!
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <VenuePanel />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={4}>
        <OpenMicPanel />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={5}>
        <EventPanel />
      </CustomTabPanel>
    </Box>
  );
}

export default AdminView;