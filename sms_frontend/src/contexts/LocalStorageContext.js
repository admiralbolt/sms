import { createContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';

const loadFromStorage = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  return (item && item != "undefined") ? JSON.parse(item) : defaultValue;
}

const loadDateFromStorage = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  const today = dayjs(dayjs().format('YYYY-MM-DD'));

  if (!item || item == "undefined") return today;

  const day = dayjs(item);
  return (day.isBefore(today)) ? today : day;
}

const LocalStorageContext = createContext();

const LocalStorageContextProvider = ({ children }) => {
  const [selectedEventTypes, setSelectedEventTypes] = useState(loadFromStorage('selectedEventTypes', []));
  const [selectedVenueTypes, setSelectedVenueTypes] = useState(loadFromStorage('selectedVenueTypes', []));
  const [selectedDate, setSelectedDate] = useState(loadDateFromStorage('selectedDate'));

  useEffect(() => {
    localStorage.setItem('selectedEventTypes', JSON.stringify(selectedEventTypes));
  }, [selectedEventTypes]);

  useEffect(() => {
    localStorage.setItem('selectedVenueTypes', JSON.stringify(selectedVenueTypes));
  }, [selectedVenueTypes]);

  useEffect(() => {
    localStorage.setItem('selectedDate', selectedDate.format('YYYY-MM-DD'));
  }, [selectedDate]);

  return (
    <LocalStorageContext.Provider value={{ selectedEventTypes, setSelectedEventTypes, selectedVenueTypes, setSelectedVenueTypes, selectedDate, setSelectedDate }}>
      {children}
    </LocalStorageContext.Provider>
  )
}

export { LocalStorageContext, LocalStorageContextProvider };