import React, { useEffect, useState } from "react";

import customAxios from "@/hooks/customAxios";
import { ChangeType, IngestionRun } from "@/types";
import { IngestionRunRecord } from "@/types";

import { ChangeTypeChip } from "./ChangeTypeChip";

import { Box, Divider, Tabs, Tab, Typography} from "@mui/material";
import { RawDataComponent } from "../RawData";

interface Props {
  run: IngestionRun;
}

export const IngestionRunFull = ({ run }: Props) => {
  const [records, setRecords] = useState<IngestionRunRecord[]>([]);
  const [sortedApis, setSortedApis] = useState<string[]>([]);
  const [apisToChangeTypes, setApisToChangeTypes] = useState<{[key: string]: ChangeType[]}>({});
  const [selectedApiChangeTypes, setSelectedApiChangeTypes] = useState<ChangeType[]>([]);
  const [breakdowns, setBreakdowns] = useState<any>({});

  const [selectedApiIndex, setSelectedApiIndex] = useState<number>(-1);
  const [selectedChangeTypeIndex, setSelectedChangeTypeIndex] = useState<number>(0);

  const handleApiChange = (event: React.SyntheticEvent, newVal: number) => {
    setSelectedApiIndex(newVal);
  }

  const handleChangeTypeChange = (event: React.SyntheticEvent, newVal: number) => {
    setSelectedChangeTypeIndex(newVal);
  }

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

    customAxios.get(`api/ingestion_runs/${run.id}/records`).then((response) => {
      setRecords(response.data);
    });
  }, [run.id]);

  return (
    <Box>
      <Box>
        <Tabs variant="scrollable" value={selectedApiIndex} onChange={handleApiChange}>
          {sortedApis?.map((api) => (
            <Tab key={`api-${api}`} label={api} />
          ))}
        </Tabs>
        <Tabs value={selectedChangeTypeIndex} onChange={handleChangeTypeChange}>
          {selectedApiChangeTypes?.map((t) => (
            <Tab icon={<ChangeTypeChip changeType={t} value={breakdowns?.[sortedApis[selectedApiIndex]]?.[t]} />} key={`api-change-type-${t}`} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{overflowY: "scroll", height: "40em"}}>
        {records.filter((record) => record.api_name == sortedApis[selectedApiIndex] && record.change_type == selectedApiChangeTypes[selectedChangeTypeIndex]).map((record) => (
          <Box key={`record-${record.id}`}>
            <Typography fontSize="1.3em">Record ID: {record.id}</Typography>
            <Typography sx={{marginBottom: "0.4em"}} fontSize="1.1em">Log: {record.change_log}</Typography>
            <RawDataComponent rawData={record.raw_data} />
            <Divider sx={{ marginTop: "1em", marginBottom: "1em"}} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
