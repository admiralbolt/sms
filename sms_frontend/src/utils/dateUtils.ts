import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

const formatDateTime = (day: Date) : string => {
  return dayjs(day).format("MMMM D, YYYY HH:mm");
};

const format24HourTime = (time: string) : string => {
  dayjs.extend(customParseFormat);
  return dayjs(time, "HH:mm:ss").format("ha");
};

export { format24HourTime, formatDateTime };