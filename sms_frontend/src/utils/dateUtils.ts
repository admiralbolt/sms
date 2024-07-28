import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

const formatDateTime = (day: Date): string => {
  return dayjs(day).format("MMMM D, YYYY HH:mm");
};

const format24HourTime = (time: string): string => {
  dayjs.extend(customParseFormat);
  return dayjs(time, "HH:mm:ss").format("ha");
};

const secondsToReadable = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  let remainder = seconds % 3600;
  const minutes = Math.floor(remainder / 60);
  remainder = Math.floor(seconds % 60);

  if (hours > 0)
    return `${hours}h ${minutes}m ${remainder}s`;

  if (minutes > 0)
    return `${minutes}m ${remainder}s`;

  return `${remainder}s`;
};

export { format24HourTime, formatDateTime, secondsToReadable };
