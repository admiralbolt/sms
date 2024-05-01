import { useEffect, useState } from "react";

import {
  AddCircleOutline,
  Delete,
  NotInterested,
  Report,
  SkipNext,
  Upgrade,
} from "@mui/icons-material";
import { Chip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import customAxios from "@/hooks/customAxios";
import { ChangeType, IngestionRun } from "@/types";
import { IngestionRunRecord } from "@/types";

interface Props {
  run: IngestionRun;
}

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

console.log(opFormat);

const columns: GridColDef[] = [
  { field: "api_name", headerName: "API", width: 180 },
  { field: "field_changed", headerName: "Obj", width: 60 },
  {
    field: "obj_name",
    headerName: "Obj Name",
    width: 300,
    valueGetter: (_value, row) => {
      return row.event_name || row.venue_name;
    },
  },
  {
    field: "change_type",
    headerName: "Code",
    width: 130,
    renderCell: (params) => {
      const Icon = opFormat.get(params.value)?.icon;
      const color = opFormat.get(params.value)?.color;

      return (
        <Chip
          //@ts-ignore
          icon={<Icon color={color} />}
          label={params.value}
          variant="outlined"
          style={{ borderColor: color, color: color }}
        />
      );
    },
  },
  { field: "change_log", headerName: "LOG", width: 500 },
];

export const IngestionRunFull = ({ run }: Props) => {
  const [records, setRecords] = useState<IngestionRunRecord[]>([]);

  useEffect(() => {
    customAxios.get(`api/ingestion_runs/${run.id}/records`).then((response) => {
      setRecords(response.data);
    });
  }, [run.id]);

  return (
    <DataGrid
      rows={records}
      columns={columns}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 25,
          },
        },
      }}
      pageSizeOptions={[10, 25, 50]}
    />
  );
};
