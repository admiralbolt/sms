import { createContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useEventTypes, useVenueTypes } from "@/hooks/api";

interface LocalStorageContextType {
  selectedEventTypes: string[];
  setSelectedEventTypes: (eventTypes: string[]) => void;
  selectedVenueTypes: string[];
  setSelectedVenueTypes: (venueTypes: string[]) => void;
  selectedDate: dayjs.Dayjs;
  setSelectedDate: (date: dayjs.Dayjs) => void;
}

const loadFromStorage = (key: string, defaultValue: unknown) => {
  const item = localStorage.getItem(key);
  return item && item !== "undefined" ? JSON.parse(item) : defaultValue;
};

const loadDateFromStorage = (
  key: string,
  defaultValue: dayjs.Dayjs
): dayjs.Dayjs => {
  const item = localStorage.getItem(key);
  const today = dayjs(dayjs().format("YYYY-MM-DD"));

  if (!item || item === "undefined") return defaultValue;

  const day = dayjs(item);
  return day.isBefore(today) ? today : day;
};

const LocalStorageContext = createContext<LocalStorageContextType | undefined>(
  undefined
);

const LocalStorageContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const eventTypes = useEventTypes();
  const venueTypes = useVenueTypes();
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(
    loadFromStorage("selectedEventTypes", [])
  );
  const [selectedVenueTypes, setSelectedVenueTypes] = useState<string[]>(
    loadFromStorage("selectedVenueTypes", [])
  );
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(
    loadDateFromStorage("selectedDate", dayjs())
  );

  useEffect(() => {
    localStorage.setItem(
      "selectedEventTypes",
      JSON.stringify(selectedEventTypes)
    );
  }, [selectedEventTypes]);

  useEffect(() => {
    localStorage.setItem(
      "selectedVenueTypes",
      JSON.stringify(selectedVenueTypes)
    );
  }, [selectedVenueTypes]);

  useEffect(() => {
    localStorage.setItem("selectedDate", selectedDate.format("YYYY-MM-DD"));
  }, [selectedDate]);

  useEffect(() => {
    if (selectedEventTypes.length == 0) {
      setSelectedEventTypes(eventTypes);
    }
  }, [eventTypes]);

  useEffect(() => {
    if (selectedVenueTypes.length == 0) {
      setSelectedVenueTypes(venueTypes);
    }
  }, [venueTypes]);

  return (
    <LocalStorageContext.Provider
      value={{
        selectedEventTypes,
        setSelectedEventTypes,
        selectedVenueTypes,
        setSelectedVenueTypes,
        selectedDate,
        setSelectedDate,
      }}
    >
      {children}
    </LocalStorageContext.Provider>
  );
};

export { LocalStorageContext, LocalStorageContextProvider };
