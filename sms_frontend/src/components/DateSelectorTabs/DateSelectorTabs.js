import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { LocalStorageContext } from '../../contexts/LocalStorageContext';
import React, { useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';

import './DateSelectorTabs.css';
import { useIsMobile } from '../../hooks/window';
import { useScroller } from '../../hooks/materialHacks';

const today = dayjs(dayjs().format('YYYY-MM-DD'));

const DateSelectorTabs = () => {
  const [dateRange, setDateRange] = useState([]);
  const [total, setTotal] = useState(21);
  const { selectedDate, setSelectedDate } = useContext(LocalStorageContext);
  const [value, setValue] = useState(today.format('YYYY-MM-DD'));
  const isMobile = useIsMobile();
  const minOffset = Math.trunc(total / 2);

  const scroller = useScroller();

  useEffect(() => {
    setTotal((isMobile) ? 11 : 21);
  }, [isMobile]);

  const handleChange = (event, newValue) => {
    // Get a tab, and calculate it's width.
    const randomTab = document.getElementsByClassName("MuiTab-textColorPrimary")[0]
    setValue(newValue);
    setSelectedDate(dayjs(newValue));
    scroller.scrollLeft = (total * randomTab.offsetWidth - scroller.offsetWidth) / 2 - randomTab.offsetWidth / 20;
  };

  useEffect(() => {
    setValue(selectedDate.format('YYYY-MM-DD'));
    let dateList = [];
    const djs = dayjs(selectedDate);

    let start = Math.max(-minOffset, today.diff(selectedDate, "days"));
    let end = start + total;

    for (let i = start; i < end; ++i) {
      dateList.push(djs.add(i, "day"));
    }

    setDateRange(dateList);
  }, [selectedDate, total]);

  return (
    <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons={true} allowScrollButtonsMobile={true}>
      {dateRange.map((day) => (
        <Tab key={day} label={day.format('ddd, MMM. D')}  value={day.format('YYYY-MM-DD')} />
      ))}
    </Tabs>
  )
}

export default DateSelectorTabs;