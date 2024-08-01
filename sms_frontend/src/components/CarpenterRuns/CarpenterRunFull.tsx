import React, { useEffect, useState } from "react";

import { Box, Divider, Grid, Tab, Tabs, Typography } from "@mui/material";

import { ChangeTypeChip } from "@/components/IngestionRuns/ChangeTypeChip";
import customAxios from "@/hooks/customAxios";
import { CarpenterRun, ChangeType } from "@/types";
import { CarpenterRunRecord } from "@/types";

import { OpenMicCard } from "../OpenMics/OpenMicCard";
import { RawDataComponent } from "../RawData";

interface Props {
  run: CarpenterRun;
}

export const CarpenterRunFull = ({ run }: Props) => {
  const [selectedRecord, setSelectedRecord] = useState<CarpenterRunRecord>(
    {} as CarpenterRunRecord,
  );
  const [records, setRecords] = useState<CarpenterRunRecord[]>([]);
  const [sortedApis, setSortedApis] = useState<string[]>([]);
  const [apisToChangeTypes, setApisToChangeTypes] = useState<{
    [key: string]: ChangeType[];
  }>({});
  const [selectedApiChangeTypes, setSelectedApiChangeTypes] = useState<
    ChangeType[]
  >([]);
  const [breakdowns, setBreakdowns] = useState<any>({});

  const [filteredRecords, setFilteredRecords] = useState<CarpenterRunRecord[]>(
    [],
  );

  const [selectedApiIndex, setSelectedApiIndex] = useState<number>(-1);
  const [selectedChangeTypeIndex, setSelectedChangeTypeIndex] =
    useState<number>(0);

  const handleApiChange = (_event: React.SyntheticEvent, newVal: number) => {
    setSelectedApiIndex(newVal);
  };

  const handleChangeTypeChange = (
    _event: React.SyntheticEvent,
    newVal: number,
  ) => {
    setSelectedChangeTypeIndex(newVal);
  };

  useEffect(() => {
    setFilteredRecords(
      records.filter(
        (record) =>
          record.api_name == sortedApis[selectedApiIndex] &&
          record.change_type == selectedApiChangeTypes[selectedChangeTypeIndex],
      ),
    );
  }, [
    records,
    sortedApis,
    selectedApiIndex,
    selectedApiChangeTypes,
    selectedChangeTypeIndex,
  ]);

  useEffect(() => {
    if (Object.keys(breakdowns).length == 0) return;
    const l = apisToChangeTypes[sortedApis[selectedApiIndex]];

    if (l == undefined) return;

    setSelectedApiChangeTypes(l);
  }, [apisToChangeTypes, sortedApis, selectedApiIndex, breakdowns]);

  useEffect(() => {
    let breakdownValues: any = {};
    let s = new Set<string>();
    let apiToChangeMap: { [key: string]: Set<ChangeType> } = {};

    run.summary.forEach((record) => {
      if (!(record.api_name in breakdownValues)) {
        breakdownValues[record.api_name] = {};
      }
      breakdownValues[record.api_name][record.change_type] = record.total;
      s.add(record.api_name);
      if (!(record.api_name in apiToChangeMap)) {
        apiToChangeMap[record.api_name] = new Set<ChangeType>();
      }
      apiToChangeMap[record.api_name].add(record.change_type);
    });
    setBreakdowns(breakdownValues);

    const apis = Array.from(s);
    apis.sort();

    let finalApiMap: { [key: string]: ChangeType[] } = {};
    for (const [api_name, change_types] of Object.entries(apiToChangeMap)) {
      let l = Array.from(change_types);
      l.sort();
      finalApiMap[api_name] = l;
    }

    setApisToChangeTypes(finalApiMap);
    setSortedApis(apis);
    setSelectedApiIndex(0);

    customAxios.get(`api/carpenter_runs/${run.id}/records`).then((response) => {
      setRecords(response.data);
    });
  }, [run.id]);

  const recordClickHandler = (record: CarpenterRunRecord) => () => {
    setSelectedRecord(record);
  };

  const getObjId = (record: CarpenterRunRecord) => {
    let id = undefined;

    if (record.field_changed == "artist") {
      id = record.artist?.id;
    } else if (record.field_changed == "event") {
      return record.event?.id;
    } else if (record.field_changed == "venue") {
      return record.venue?.id;
    }

    return id || -1;
  };

  const getObjName = (record: CarpenterRunRecord) => {
    let name = undefined;

    if (record.field_changed == "artist") {
      name = record.artist?.name;
    } else if (record.field_changed == "event") {
      name = record.event?.title;
    } else if (record.field_changed == "venue") {
      name = record.venue?.name;
    }

    return name || "UNKNOWN";
  };

  const getObjData = (record: CarpenterRunRecord) => {
    let data = {};

    if (record.field_changed == "artist") {
      data = record.artist;
    } else if (record.field_changed == "event") {
      data = record.event;
    } else if (record.field_changed == "venue") {
      data = record.venue;
    }

    return JSON.stringify(data, null, 2);
  };

  return (
    <Box>
      <Box sx={{ marginBottom: "0.5em" }}>
        <Tabs
          variant="scrollable"
          value={selectedApiIndex}
          onChange={handleApiChange}
        >
          {sortedApis?.map((api) => <Tab key={`api-${api}`} label={api} />)}
        </Tabs>
        <Tabs value={selectedChangeTypeIndex} onChange={handleChangeTypeChange}>
          {selectedApiChangeTypes?.map((t) => (
            <Tab
              icon={
                <ChangeTypeChip
                  changeType={t}
                  value={breakdowns?.[sortedApis[selectedApiIndex]]?.[t]}
                />
              }
              key={`api-change-type-${t}`}
            />
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
                {record.id} | {record.field_changed} | {getObjId(record)}:{" "}
                {getObjName(record)}
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
          {selectedRecord?.id && (
            <Box>
              <Typography>Record ID: {selectedRecord.id}</Typography>
              <pre style={{ fontSize: "0.7em" }}>
                {selectedRecord.change_log}
              </pre>
              <br />
              <Typography>Obj ID: {getObjId(selectedRecord)}</Typography>
              <Typography>Obj Name: {getObjId(selectedRecord)}</Typography>
              <Typography>Obj Data:</Typography>
              <pre style={{ fontSize: "0.7em" }}>
                {getObjData(selectedRecord)}
              </pre>
              <br />
              {selectedRecord?.raw_data && (
                <RawDataComponent rawData={selectedRecord.raw_data} />
              )}
              {selectedRecord?.open_mic && (
                <OpenMicCard openMic={selectedRecord.open_mic} />
              )}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
