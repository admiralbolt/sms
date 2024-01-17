import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { LocalStorageContext } from '../../contexts/LocalStorageContext';
import React, { useContext, useState } from 'react';

import './DateSelectorTabs.css';

const DateSelectorTabs = () => {
  const [value, setValue] = useState(0);
  
  const { selectedDate } = useContext(LocalStorageContext);

  const handleChange = (event, newValue) => {
    console.log(newValue);
    setValue(newValue);
  };

  return (
    <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons={true} allowScrollButtonsMobile={true}>
      <Tab label="Tue, Jan 16" />
      <Tab label="Wed, Jan 17" />
      <Tab label="Thu, Jan 18" />
      <Tab label="Fri, Jan 19" />
      <Tab label="Sat, Jan 20" />
      <Tab label="Sun, Jan 21" />
      <Tab label="Mon, Jan 22" />
    </Tabs>
  )
}

export default DateSelectorTabs;