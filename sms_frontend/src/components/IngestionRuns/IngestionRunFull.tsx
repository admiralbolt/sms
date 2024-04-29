import { useEffect, useState } from 'react';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import ReportIcon from '@mui/icons-material/Report';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import { Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import customAxios from '@/hooks/customAxios';
import { IngestionRun } from '@/types';
import { IngestionRunRecord } from '@/types';

interface Props {
  run: IngestionRun;
}

const opFormat: any = {
  Create: {
    icon: AddCircleOutlineIcon,
    color: '#00ffaa',
  },
  Update: {
    icon: UpgradeIcon,
    color: '#00aaff',
  },
  Delete: {
    icon: DeleteIcon,
    color: '#ff8080',
  },
  Error: {
    icon: ReportIcon,
    color: '#ff4040',
  },
  'NO OP': {
    icon: NotInterestedIcon,
    color: '#aaaaaa',
  },
  Skip: {
    icon: SkipNextIcon,
    color: '#ffaa40',
  },
};

const columns: GridColDef[] = [
  { field: 'api_name', headerName: 'API', width: 180 },
  { field: 'field_changed', headerName: 'Obj', width: 60 },
  {
    field: 'obj_name',
    headerName: 'Obj Name',
    width: 300,
    valueGetter: (_value, row) => {
      return row.event_name || row.venue_name;
    },
  },
  {
    field: 'change_type',
    headerName: 'Code',
    width: 130,
    renderCell: (params) => {
      const Icon = opFormat[params.value]['icon'];
      const color = opFormat[params.value]['color'];

      return (
        <Chip
          icon={<Icon color={color} />}
          label={params.value}
          variant="outlined"
          style={{ borderColor: color, color: color }}
        />
      );
    },
  },
  { field: 'change_log', headerName: 'LOG', width: 500 },
];

const IngestionRunFull = ({ run }: Props) => {
  const [records, setRecords] = useState<IngestionRunRecord[]>([]);

  useEffect(() => {
    customAxios.get(`api/ingestion_runs/${run.id}/records`).then((response) => {
      setRecords(response.data);
    });
  }, []);

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

export default IngestionRunFull;
