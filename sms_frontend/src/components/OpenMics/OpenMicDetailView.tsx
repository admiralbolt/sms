// Top level component that gets routed to.
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Typography } from "@mui/material";

import { getOpenMicBySlug } from "@/hooks/api";
import { OpenMic } from "@/types";
import { setMeta } from "@/utils/seo";

import { OpenMicDetail } from "./OpenMicDetail";

export const OpenMicDetailView = () => {
  const [openMic, setOpenMic] = useState<OpenMic>({} as OpenMic);
  const { slug } = useParams();

  useEffect(() => {
    getOpenMicBySlug(slug).then((res) => {
      setOpenMic(res);
      // TODO: Set the description here eventually once the openMic descriptions
      //   have actually been vetted.
      setMeta({
        title: `Seattle Music OpenMic - ${res.name}`,
      });
    });
  }, [slug]);

  if (Object.keys(openMic).length === 0) {
    return (
      <Typography sx={{ fontSize: "2rem", padding: "1rem" }}>
        No Such OpenMic found <br />
        Try typing better
      </Typography>
    );
  } else {
    return <OpenMicDetail openMic={openMic} />;
  }
};
