import { createContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';

const loadFromStorage = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  return (item && item != "undefined") ? JSON.parse(item) : defaultValue;
}

const loadDateFromStorage = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  return (item && item != "undefined") ? dayjs(item) : dayjs(defaultValue);
}

const LocalStorageContext = createContext();

const LocalStorageContextProvider = ({ children }) => {
  const [selectedEventTypes, setSelectedEventTypes] = useState(loadFromStorage('selectedEventTypes', []));
  const [selectedVenueTypes, setSelectedVenueTypes] = useState(loadFromStorage('selectedVenueTypes', []));
  const [selectedDate, setSelectedDate] = useState(loadDateFromStorage('selectedDate'), dayjs().format('YYYY-MM-DD'));

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