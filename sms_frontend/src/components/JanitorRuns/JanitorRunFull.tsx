import React, { useEffect, useState } from "react";

import { Box, Divider, Grid, Tab, Tabs, Typography } from "@mui/material";

import customAxios from "@/hooks/customAxios";
import { JanitorRun } from "@/types";
import { JanitorRunRecord } from "@/types";

interface Props {
  run: JanitorRun;
}

export const JanitorRunFull = ({ run }: Props) => {
  const [selectedRecord, setSelectedRecord] = useState<JanitorRunRecord>(
    {} as JanitorRunRecord,
  );
  const [records, setRecords] = useState<JanitorRunRecord[]>([]);
  const [sortedOperations, setSortedOperations] = useState<string[]>([]);

  const [breakdowns, setBreakdowns] = useState<any>({});

  const [filteredRecords, setFilteredRecords] = useState<JanitorRunRecord[]>(
    [],
  );

  const [selectedOperationIndex, setSelectedOperationIndex] =
    useState<number>(-1);

  const handleOperationChange = (
    _event: React.SyntheticEvent,
    newVal: number,
  ) => {
    setSelectedOperationIndex(newVal);
  };

  useEffect(() => {
    setFilteredRecords(
      records.filter(
        (record) =>
          record.operation == sortedOperations[selectedOperationIndex],
      ),
    );
  }, [records, sortedOperations, selectedOperationIndex]);

  useEffect(() => {
    let breakdownValues: any = {};
    let s = new Set<string>();

    run.summary.forEach((record) => {
      if (!(record.operation in breakdownValues)) {
        breakdownValues[record.operation] = record.total;
      }

      s.add(record.operation);
    });

    setBreakdowns(breakdownValues);

    const operations = Array.from(s);
    operations.sort();
    setSortedOperations(operations);
    setSelectedOperationIndex(0);

    customAxios.get(`api/janitor_runs/${run.id}/records`).then((response) => {
      setRecords(response.data);
    });
  }, [run.id]);

  const recordClickHandler = (record: JanitorRunRecord) => () => {
    setSelectedRecord(record);
  };

  const getEventName = (record: JanitorRunRecord) => {
    return (
      record.merge_event_record?.to_event?.title ||
      record.apply_artists_record?.event?.title ||
      "UNKNOWN"
    );
  };

  return (
    <Box>
      <Box sx={{ marginBottom: "0.5em" }}>
        <Tabs
          variant="scrollable"
          value={selectedOperationIndex}
          onChange={handleOperationChange}
        >
          {sortedOperations?.map((op) => (
            <Tab key={`op-${op}`} label={`${op} - ${breakdowns[op]}`} />
          ))}
        </Tabs>
      </Box>
      <Grid sx={{ border: "1px solid #cccccc", padding: "0.5em" }} container>
        <Grid
          sx={{ overflowY: "scroll", height: "40em", padding: "0.4em" }}
          item
          xs={6}
        >
          {filteredRecords.map((record) => (
            <Box
              onClick={recordClickHandler(record)}
              key={`record-${record.id}`}
            >
              <Typography fontSize="0.9em">
                {record.id} | {getEventName(record)}
              </Typography>
              <pre style={{ fontSize: "0.7em" }}>
                {record.change_log.split("\n")[0]}
              </pre>
              <Divider sx={{ marginTop: "1em", marginBottom: "1em" }} />
            </Box>
          ))}
        </Grid>
        <Grid
          sx={{ overflowY: "scroll", height: "40em", padding: "0.4em" }}
          item
          xs={6}
        >
          {selectedRecord.id && (
            <Box>
              <Typography>Record ID: {selectedRecord.id}</Typography>
              <pre style={{ fontSize: "0.7em" }}>
                {selectedRecord.change_log}
              </pre>
              <Divider />
              <pre style={{ fontSize: "0.7em" }}>
                {JSON.stringify(
                  selectedRecord?.merge_event_record ||
                    selectedRecord?.apply_artists_record,
                  null,
                  2,
                )}
              </pre>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
