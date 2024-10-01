import { useEffect, useState } from "react";

import { Box, Button, Tab, Tabs } from "@mui/material";

import { useOpenMics } from "@/hooks/api";
import { useIsAuthenticated } from "@/hooks/auth";
import { OpenMic } from "@/types";
import { setMeta } from "@/utils/seo";

import { OpenMicCard } from "./OpenMicCard";
import { OpenMicForm } from "./OpenMicForm";

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

export const OpenMicView = () => {
  const [isAuthenticated, _] = useIsAuthenticated();
  const [createNew, setCreateNew] = useState<boolean>(false);

  const [tab, setTab] = useState(0);

  const [openMics] = useOpenMics();
  const emptyMicsByDay: { [key: string]: OpenMic[] } = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };
  const [openMicsByDay, setOpenMicsByDay] = useState<{
    [key: string]: OpenMic[];
  }>(emptyMicsByDay);

  useEffect(() => {
    let micsByDay: { [key: string]: OpenMic[] } = {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };
    openMics.forEach((mic) => {
      micsByDay[mic.day].push(mic);
    });
    setOpenMicsByDay(micsByDay);
  }, [openMics]);

  setMeta({
    title: "Seattle Open Mics",
    description: "A listing of all open mics in seattle.",
  });

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  if (createNew) {
    return (
      <OpenMicForm
        openMic={{} as OpenMic}
        setEdit={setCreateNew}
        isNew={true}
      />
    );
  } else {
    return (
      <Box sx={{ width: "100%" }}>
        {isAuthenticated && (
          <Button
            onClick={() => {
              setCreateNew(true);
            }}
          >
            Create New Open Mic
          </Button>
        )}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tab}
            onChange={handleChange}
            aria-label="basic tabs example"
            variant="scrollable"
          >
            <Tab label="Sunday" {...a11yProps(0)} />
            <Tab label="Monday" {...a11yProps(1)} />
            <Tab label="Tuesday" {...a11yProps(2)} />
            <Tab label="Wednesday" {...a11yProps(3)} />
            <Tab label="Thursday" {...a11yProps(4)} />
            <Tab label="Friday" {...a11yProps(5)} />
            <Tab label="Saturday" {...a11yProps(6)} />
          </Tabs>
          <CustomTabPanel value={tab} index={0}>
            {openMicsByDay["Sunday"].map((mic) => (
              <OpenMicCard key={mic.id} openMic={mic} />
            ))}
          </CustomTabPanel>
          <CustomTabPanel value={tab} index={1}>
            {openMicsByDay["Monday"].map((mic) => (
              <OpenMicCard key={mic.id} openMic={mic} />
            ))}
          </CustomTabPanel>
          <CustomTabPanel value={tab} index={2}>
            {openMicsByDay["Tuesday"].map((mic) => (
              <OpenMicCard key={mic.id} openMic={mic} />
            ))}
          </CustomTabPanel>
          <CustomTabPanel value={tab} index={3}>
            {openMicsByDay["Wednesday"].map((mic) => (
              <OpenMicCard key={mic.id} openMic={mic} />
            ))}
          </CustomTabPanel>
          <CustomTabPanel value={tab} index={4}>
            {openMicsByDay["Thursday"].map((mic) => (
              <OpenMicCard key={mic.id} openMic={mic} />
            ))}
          </CustomTabPanel>
          <CustomTabPanel value={tab} index={5}>
            {openMicsByDay["Friday"].map((mic) => (
              <OpenMicCard key={mic.id} openMic={mic} />
            ))}
          </CustomTabPanel>
          <CustomTabPanel value={tab} index={6}>
            {openMicsByDay["Saturday"].map((mic) => (
              <OpenMicCard key={mic.id} openMic={mic} />
            ))}
          </CustomTabPanel>
        </Box>
      </Box>
    );
  }
};
