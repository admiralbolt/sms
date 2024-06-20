import { useEffect, useState } from "react";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import customAxios from "@/hooks/customAxios";
import { JanitorRun } from "@/types";
import { JanitorRunRecord } from "@/types";

import { ChangeTypeChip } from "@/components/IngestionRuns/ChangeTypeChip";

interface Props {
  run: JanitorRun;
}

const columns: GridColDef[] = [
  { field: "api_name", headerName: "API", width: 180 },
  { field: "field_changed", headerName: "Obj", width: 60 },
  {
    field: "obj_name",
    headerName: "Obj Name",
    width: 300,
    valueGetter: (_value, row) => {
      if (row.field_changed == "none")
        return "none"

      if (row.field_changed == "event")
        return row.raw_data.event_name;
      
      if (row.field_changed == "venue")
        return row.raw_data.venue_name;

      if (row.field_changed == "artist")
        return row.artist_name;
    },
  },
  {
    field: "change_type",
    headerName: "Code",
    width: 130,
    renderCell: (params) => {
      return <ChangeTypeChip changeType={params.value} />;
    },
  },
  { field: "change_log", headerName: "LOG", width: 500 },
];

export const JanitorRunFull = ({ run }: Props) => {
  const [records, setRecords] = useState<JanitorRunRecord[]>([]);

  useEffect(() => {
    customAxios.get(`api/janitor_runs/${run.id}/records`).then((response) => {
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
