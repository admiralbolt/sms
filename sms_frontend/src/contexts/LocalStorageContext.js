import { createContext, useEffect, useState } from 'react';

const loadArrayFromStorage = (key) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : [];
}

const LocalStorageContext = createContext();

const LocalStorageContextProvider = ({ children }) => {
  const [selectedEventTypes, setSelectedEventTypes] = useState(loadArrayFromStorage('selectedEventTypes'));
  const [selectedVenueTypes, setSelectedVenueTypes] = useState(loadArrayFromStorage('selectedVenueTypes'));

  useEffect(() => {
    localStorage.setItem('selectedEventTypes', JSON.stringify(selectedEventTypes));
  }, [selectedEventTypes]);

  useEffect(() => {
    localStorage.setItem('selectedVenueTypes', JSON.stringify(selectedVenueTypes));
  }, [selectedVenueTypes]);

  return (
    <LocalStorageContext.Provider value={{ selectedEventTypes, setSelectedEventTypes, selectedVenueTypes, setSelectedVenueTypes }}>
      {children}
    </LocalStorageContext.Provider>
  )
}

export { LocalStorageContext, LocalStorageContextProvider };