import OpenMicForm from "@/components/OpenMicForm";
import { getOpenMicById } from "@/hooks/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { OpenMic } from "@/types";

const OpenMicView = () => {
  const { id } = useParams();
  const [openMic, setOpenMic] = useState<OpenMic>({});
  
  useEffect(() => {
    (async () => {
      setOpenMic(await getOpenMicById(id));
    })();
  }, [id]);

  return (
    <OpenMicForm openMic={openMic} />
  );
};

export default OpenMicView;