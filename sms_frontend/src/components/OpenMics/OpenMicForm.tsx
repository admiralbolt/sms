import { OpenMic } from "@/types";

import { useSchema } from "@/hooks/schema";
import VenueSelect from "@/components/VenueSelect";

import validator from '@rjsf/validator-ajv8';
import { Form } from '@rjsf/mui';
import { WidgetProps } from "@rjsf/utils";
import { updateOpenMic } from "@/hooks/api";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import { useContext } from "react";
import { Button } from "@mui/material";
import { AxiosError } from "axios";

interface Props {
  openMic: OpenMic;
  setEdit: any;
}

const OpenMicForm = ({ openMic, setEdit }: Props) => {
  const { snackbar, setSnackbar } = useContext(SnackbarContext) || {};
  const { openMicSchema } = useSchema();

  const submit = (submitOpenMic: any) => {
    updateOpenMic(submitOpenMic.formData).then((response) => {
      setSnackbar({open: true, severity: "success", message: `openMic ${response.data.title} updated successfully!`});
      setEdit(false);
      // setOpenMic(response.data);
    }, (error: AxiosError) => {
      setSnackbar({open: true, severity: "error", message: error.message});
    });
  }

  const uiSchema: object = {
    "description": {
      "ui:widget": "textarea"
    },
    "signup_start_time": {
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
      <Button sx={{marginLeft: "2em"}} onClick={() => {setEdit(false)}} variant="outlined">Cancel</Button>
    </Form>
  );
};

export default OpenMicForm;