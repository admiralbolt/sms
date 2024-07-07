import * as React from "react";

import { Box, Tab, Tabs } from "@mui/material";

import { ArtistPanel } from "@/components/Artists";
import { CommandPanel } from "@/components/Commands";
import { EventPanel } from "@/components/Events";
import { IngestionRunPanel } from "@/components/IngestionRuns";
import { CarpenterRunPanel } from "@/components/CarpenterRuns";
import { OpenMicPanel } from "@/components/OpenMics";
import { PeriodicTaskStatus } from "@/components/PeriodicTaskStatus";
import { VenuePanel } from "@/components/Venues";

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const AdminView = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          variant="scrollable"
        >
          <Tab label="Status" {...a11yProps(0)} />
          <Tab label="Ingestion Runs" {...a11yProps(1)} />
          <Tab label="carpenter Runs" {...a11yProps(2)} />
          <Tab label="Commands" {...a11yProps(3)} />
          <Tab label="Venues" {...a11yProps(4)} />
          <Tab label="Open Mics" {...a11yProps(5)} />
          <Tab label="Events" {...a11yProps(6)} />
          <Tab label="Artists" {...a11yProps(7)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <PeriodicTaskStatus />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <IngestionRunPanel />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <CarpenterRunPanel />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <CommandPanel />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={4}>
        <VenuePanel />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={5}>
        <OpenMicPanel />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={6}>
        <EventPanel />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={7}>
        <ArtistPanel />
      </CustomTabPanel>
    </Box>
  );
};
