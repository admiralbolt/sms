import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { LocalStorageContext } from '../../contexts/LocalStorageContext';
import React, { useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';

import './DateSelectorTabs.css';
import { useIsMobile } from '../../hooks/window';

const today = dayjs(dayjs().format('YYYY-MM-DD'));

const DateSelectorTabs = () => {
  const [dateRange, setDateRange] = useState([]);
  const { selectedDate, setSelectedDate } = useContext(LocalStorageContext);
  const [value, setValue] = useState(today.format('YYYY-MM-DD'));
  const isMobile = useIsMobile();
  const total = (isMobile) ? 11 : 21;

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setSelectedDate(dayjs(newValue));
  };

  useEffect(() => {
    setValue(selectedDate.format('YYYY-MM-DD'));
    let dateList = [];
    const djs = dayjs(selectedDate);

    let start = Math.max(-5, today.diff(selectedDate, "days"));
    let end = start + total;

    for (let i = start; i < end; ++i) {
      dateList.push(djs.add(i, "day"));
    }

    setDateRange(dateList);
  }, [selectedDate]);

  return (
    <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons={true} allowScrollButtonsMobile={true}>
      {dateRange.map((day) => (
        <Tab key={day} label={day.format('ddd, MMM. D')}  value={day.format('YYYY-MM-DD')} />
      ))}
    </Tabs>
  )
}

export default DateSelectorTabs;