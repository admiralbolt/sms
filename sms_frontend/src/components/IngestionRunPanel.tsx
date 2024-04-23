import { useIngestionRuns } from "@/hooks/api";
import { ChangeType, IngestionRunSummary } from "@/types";
import { Box, Divider, Grid, Typography} from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { formatDateTime } from "@/utils/dateUtils";

const columns: GridColDef[] = [
  { field: "api_name", headerName: "API", width: 200 },
  { field: "field_changed", headerName: "Obj Changed", width: 100},
  { field: "change_type", headerName: "Code", width: 80},
  { field: "total", headerName: "Total", width: 50}
];

const changeTypes: string[] = [
  "Create", "Delete", "Update", "Error", "NO OP", "Skip"
];

const IngestionRunPanel = () => {
  const runs = useIngestionRuns();

  const handleGetRowId = (e: any) : number => {
    return e.index;
  }

  const summarizeSummary = (summary: IngestionRunSummary[]) => {
    const s: any = {"event": {}, "venue": {}}
    changeTypes.forEach((t: string) => {
      s["event"][t] = 0;
      s["venue"][t] = 0;
    });
      
    summary.forEach((record) => {
      s[record.field_changed][record.change_type] += record.total;
    });

    return (
      <Grid container>
        <Grid textAlign="center" border="1px solid white" item xs={6}>
          Events
        </Grid>
        <Grid textAlign="center" border="1px solid white" item xs={6}>
          Venues
        </Grid>

        <Box width="100%" />
        {changeTypes.map((t) => (
          <Grid key={`event-${t}`} padding="1em" border="1px solid white" item xs={1}>
            <Typography>{t}</Typography>
          </Grid>
        ))}
        {changeTypes.map((t) => (
          <Grid key={`venue-${t}`} padding="1em" border="1px solid white" borderRight="1px solid white" item xs={1}>
            <Typography>{t}</Typography>
          </Grid>
        ))}
        {changeTypes.map((t) => (
          <Grid key={`event-val-${t}`} padding="1em" border="1px solid white" item xs={1}>
            <Typography>{s["event"][t]}</Typography>
          </Grid>
        ))}
        {changeTypes.map((t) => (
          <Grid key={`venue-val-${t}`} padding="1em" border="1px solid white" borderRight="1px solid white" item xs={1}>
            <Typography>{s["venue"][t]}</Typography>
          </Grid>
        ))}

      </Grid>
    );
  }

  const summaryGrid = (summary: IngestionRunSummary[]) => {
    return (
      <DataGrid
        rows={summary}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 25
            }
          }
        }}
        pageSizeOptions={[10, 25, 50]}
        getRowId={handleGetRowId}
        />
    );
  }

  return (
    <Box>
    {runs.map((run) => (
      <Box key={run.id}>
        <Box>
          <h2>Run Name: {run.name}</h2>
          <h3>Run At: {formatDateTime(run.created_at)}</h3>
          <h4>Id: {run.id}</h4>
          {summarizeSummary(run.summary)}
        </Box>
        <Box height="3em" width="100%" />
      </Box>
    ))}
    </Box>
  );
};

export default IngestionRunPanel;