import { useEffect, useState } from "react";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import customAxios from "@/hooks/customAxios";
import { IngestionRun } from "@/types";
import { IngestionRunRecord } from "@/types";
import { ChangeTypeChip } from "./ChangeTypeChip";

interface Props {
  run: IngestionRun;
}

const columns: GridColDef[] = [
  { field: "api_name", headerName: "API", width: 180 },
  { field: "venue_name", headerName: "Venue Name", width: 220, valueGetter: (_value, row) => {
    return row.raw_data.venue_name;
  }},
  { field: "event_name", headerName: "Event Name", width: 350, valueGetter: (_value, row) => {
    return row.raw_data.event_name;
  }},
  {
    field: "change_type",
    headerName: "Code",
    width: 130,
    renderCell: (params) => {
      return <ChangeTypeChip changeType={params.value} />
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
