import { useState } from "react";

import { Button } from "@mui/material";

import { useIsAuthenticated } from "@/hooks/auth";
import { OpenMic } from "@/types";
import { setMeta } from "@/utils/seo";

import { OpenMicForm } from "./OpenMicForm";
import { useOpenMics } from "@/hooks/api";

export const OpenMicView = () => {
  const [isAuthenticated, _] = useIsAuthenticated();
  const [createNew, setCreateNew] = useState<boolean>(false);

  const [openMics, setOpenMics] = useOpenMics();

  setMeta({
    title: "Seattle Open Mics",
    description: "A listing of all open mics in seattle.",
  });

  if (createNew) {
    return (
      <OpenMicForm openMic={{} as OpenMic} setEdit={setCreateNew} isNew={true} />
    );
  } else {
    return (
      <>
        {isAuthenticated && (
          <Button
            onClick={() => {
              setCreateNew(true);
            }}
          >
            Create New Open Mic
          </Button>
        )}
        <div style={{ padding: "12px 5px 5px 5px" }}>
          {openMics.map((mic) => (
            <p key={mic.id}>{mic.name}</p>
          ))}
        </div>
      </>
    );
  }
};
