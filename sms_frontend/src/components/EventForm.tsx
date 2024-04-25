import { Event } from "@/types";

import { useSchema } from "@/hooks/schema";
import VenueSelect from "@/components/Venues/VenueSelect";

import validator from '@rjsf/validator-ajv8';
import { Form } from '@rjsf/mui';
import { WidgetProps } from "@rjsf/utils";
import { updateEvent } from "@/hooks/api";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import { useContext } from "react";
import { Button } from "@mui/material";

interface Props {
  event: Event;
  setEdit: any;
  setEvent: any;
}

const EventForm = ({ event, setEdit, setEvent }: Props) => {
  const { snackbar, setSnackbar } = useContext(SnackbarContext) || {};
  const { eventSchema } = useSchema();

  const submit = (submitEvent: any) => {
    updateEvent(submitEvent.formData).then((response) => {
      setSnackbar({open: true, severity: "success", message: `Event ${response.data.title} updated successfully!`});
      setEdit(false);
      setEvent(response.data);
    }, (error) => {
      setSnackbar({open: true, severity: "error", message: error});
    });
  }

  const uiSchema: object = {
    "description": {
      "ui:widget": "textarea"
    },
    "event_image": {
      "ui:widget": "hidden"
    },
    "start_time": {
      "ui:widget": "time"
    },
    "end_time": {
      "ui:widget": "time"
    },
    "doors_open": {
      "ui:widget": "time"
    },
    "signup_start_time": {
      "ui:widget": "time"
    },
    "venue": {
      "ui:widget": (props: WidgetProps) => {
        return (
          <VenueSelect venueId={props.value} onChange={(event: any) => props.onChange(event.target.value)} />
        );
      }
    }
  }

  return (
    <Form
      schema={eventSchema}
      uiSchema={uiSchema}
      formData={event}
      validator={validator}
      onSubmit={submit}
    >
      <Button type="submit" variant="contained">Submit</Button>
      <Button sx={{marginLeft: "2em"}} onClick={() => {setEdit(false)}} variant="outlined">Cancel</Button>
    </Form>
  );
};

export default EventForm;