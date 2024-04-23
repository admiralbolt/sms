import dayjs from "dayjs";

const formatDateTime = (day: Date) : string => {
  return dayjs(day).format("MMMM D, YYYY HH:mm");
};

export { formatDateTime };