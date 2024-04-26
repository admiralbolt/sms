import { OpenMic } from "@/types";

import { useSchema } from "@/hooks/schema";
import VenueSelect from "@/components/Venues/VenueSelect";

import validator from '@rjsf/validator-ajv8';
import { Form } from '@rjsf/mui';
import { WidgetProps } from "@rjsf/utils";
import { createOpenMic, updateOpenMic } from "@/hooks/api";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import { useContext } from "react";
import { Button } from "@mui/material";
import { AxiosError } from "axios";

interface Props {
  openMic: OpenMic;
  setEdit: any;
  isNew?: boolean;
  setIsNew?: any;
  createCallback?: any;
}

const OpenMicForm = ({ openMic, setEdit, isNew, createCallback }: Props) => {
  const { setSnackbar } = useContext(SnackbarContext) || {};
  const { openMicSchema } = useSchema();

  const submit = (submitOpenMic: any) => {
    if (isNew) {
      createOpenMic(submitOpenMic.formData).then((response) => {
        setSnackbar({open: true, severity: "success", message: `openMic ${response.data.name} updated successfully!`});
        setEdit(false);
        createCallback(response.data["id"]);
      }, (error: AxiosError) => {
        setSnackbar({open: true, severity: "error", message: error.message});
      });

      return;
    }

    updateOpenMic(submitOpenMic.formData).then((response) => {
      setSnackbar({open: true, severity: "success", message: `openMic ${response.data.name} updated successfully!`});
      setEdit(false);
    }, (error: AxiosError) => {
      setSnackbar({open: true, severity: "error", message: error.message});
    });
  }

  const cancel = () => {
    setEdit(false);
  }

  const uiSchema: object = {
    "description": {
      "ui:widget": "textarea"
    },
    "signup_start_time": {
      "ui:widget": "time"
    },
    "event_start_time": {
      "ui:widget": "time"
    },
    "event_end_time": {
      "ui:widget": "time"
    },
    "venue": {
      "ui:widget": (props: WidgetProps) => {
        return (
          <VenueSelect venueId={props.value} onChange={(openMic: any) => props.onChange(openMic.target.value)} />
        );
      }
    }
  }

  return (
    <Form
      schema={openMicSchema}
      uiSchema={uiSchema}
      formData={openMic}
      validator={validator}
      onSubmit={submit}
    >
      <Button type="submit" variant="contained">Submit</Button>
      <Button sx={{marginLeft: "2em"}} onClick={cancel} variant="outlined">Cancel</Button>
    </Form>
  );
};

OpenMicForm.defaultProps = {
  "isNew": false
}

export default OpenMicForm;