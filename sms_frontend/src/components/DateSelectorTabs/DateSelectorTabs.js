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
  const minOffset = -Math.trunc(total / 2);

  const scroller = useScroller();

  useEffect(() => {
    setTotal((isMobile) ? 11 : 21);
  }, [isMobile]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setSelectedDate(dayjs(newValue));
  };

  useEffect(() => {
    setValue(selectedDate.format('YYYY-MM-DD'));
    let dateList = [];
    const djs = dayjs(selectedDate);

    let start = Math.max(minOffset, today.diff(selectedDate, "days"));
    let end = start + total;

    for (let i = start; i < end; ++i) {
      dateList.push(djs.add(i, "day"));
    }
    
    if (JSON.stringify(dateList) != JSON.stringify(dateRange)) {
      setDateRange(dateList);
    }
  }, [selectedDate, total]);

  const centerSelected = () => {
    const allTabs = document.getElementsByClassName("MuiTab-textColorPrimary");
    let totalWidth = 0;
    for (let i = 0; i < allTabs.length; ++i) {
      totalWidth += allTabs[i].offsetWidth;
    }

    scroller.scrollLeft = (totalWidth - scroller.offsetWidth) / 2;
  }

  return (
    <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons={true} allowScrollButtonsMobile={true}>
      {dateRange.map((day) => (
        <Tab key={day} label={day.format('ddd, MMM. D')}  value={day.format('YYYY-MM-DD')} />
      ))}
    </Tabs>
  )
}

export default DateSelectorTabs;