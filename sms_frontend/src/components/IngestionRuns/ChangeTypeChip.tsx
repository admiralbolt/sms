import { ChangeType } from "@/types";
import {
  AddCircleOutline,
  Delete,
  NotInterested,
  Report,
  SkipNext,
  Upgrade,
} from "@mui/icons-material";

import { Chip } from "@mui/material";

type OpIcon = {
  icon: any;
  color: string;
};


const opFormat: Map<ChangeType, OpIcon> = new Map([
  [
    "Create",
    {
      icon: AddCircleOutline,
      color: "#00ffaa",
    },
  ],
  [
    "Update",
    {
      icon: Upgrade,
      color: "#00aaff",
    },
  ],
  [
    "Delete",
    {
      icon: Delete,
      color: "#ff8080",
    },
  ],
  [
    "Error",
    {
      icon: Report,
      color: "#ff4040",
    },
  ],
  [
    "NO OP",
    {
      icon: NotInterested,
      color: "#aaaaaa",
    },
  ],
  [
    "Skip",
    {
      icon: SkipNext,
      color: "#ffaa40",
    },
  ],
]);


interface Props {
  changeType: ChangeType;
}

export const ChangeTypeChip = ({ changeType }: Props) => {

  const Icon = opFormat.get(changeType)?.icon;
  const color = opFormat.get(changeType)?.color;

  return (
    <Chip
      //@ts-ignore
      icon={<Icon color={color} />}
      label={changeType}
      variant="outlined"
      style={{ borderColor: color, color: color, width: "7em" }}
    />
  )
}