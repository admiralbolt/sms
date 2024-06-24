import {
  AddCircleOutline,
  Delete,
  NotInterested,
  Report,
  SkipNext,
  Upgrade,
} from "@mui/icons-material";
import { Chip, Typography } from "@mui/material";

import { ChangeType } from "@/types";

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
  value?: any;
}

export const ChangeTypeChip = ({ changeType, value }: Props) => {
  const Icon = opFormat.get(changeType)?.icon;
  const color = opFormat.get(changeType)?.color;

  const label = value ? `${changeType} - ${value}` : `${changeType} - 0`;

  return (
    <Chip
      //@ts-ignore
      icon={<Icon color={color} />}
      label={label}
      variant="outlined"
      style={{ borderColor: color, color: color, width: "10.5em" }}
    />
  );
};
