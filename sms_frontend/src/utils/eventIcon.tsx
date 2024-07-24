import { FaGuitar } from "react-icons/fa6";
import { PiMicrophoneStageFill } from "react-icons/pi";

import { EventType } from "@/types";

const SHOW_COLOR = "#0070ff";
const OPEN_JAM_COLOR = "#ff5500";
const OPEN_MIC_COLOR = "#ee6600";

export const getEventIcon = (event_type: EventType) => {
  const lowercaseEventType =
    event_type != undefined ? event_type.toLowerCase() : "";
  if (lowercaseEventType == "open mic" || lowercaseEventType == "open jam") {
    return (
      <PiMicrophoneStageFill
        size={20}
        color={
          lowercaseEventType == "open jam" ? OPEN_JAM_COLOR : OPEN_MIC_COLOR
        }
      />
    );
  }

  return <FaGuitar size={20} color={SHOW_COLOR} />;
};
