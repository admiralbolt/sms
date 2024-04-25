import { Venue } from "@/types";

import { useSchema } from "@/hooks/schema";

import validator from '@rjsf/validator-ajv8';
import { Form } from '@rjsf/mui';
import { createVenue, updateVenue } from "@/hooks/api";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import { useContext } from "react";
import { Button } from "@mui/material";
import { AxiosError } from "axios";

interface Props {
  venue: Venue;
  setEdit: any;
  isNew?: boolean;
  setIsNew?: any;
  createCallback?: any;
  updateCallback?: any;
}

const VenueForm = ({ venue, setEdit, isNew, createCallback, updateCallback }: Props) => {
  const { snackbar, setSnackbar } = useContext(SnackbarContext) || {};
  const { venueSchema } = useSchema();

  const submit = (submitVenue: any) => {
    if (isNew) {
      createVenue(submitVenue.formData).then((response) => {
        setSnackbar({open: true, severity: "success", message: `Venue ${response.data.name} updated successfully!`});
        setEdit(false);
        createCallback(response.data["id"]);
      }, (error: AxiosError) => {
        setSnackbar({open: true, severity: "error", message: error.message});
      });

      return;
    }

    updateVenue(submitVenue.formData).then((response) => {
      setSnackbar({open: true, severity: "success", message: `Venue ${response.data.name} updated successfully!`});
      setEdit(false);
      updateCallback(response.data["id"]);
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
    "venue_tags": {
      "ui:widget": "hidden"
    },
    "venue_image": {
      "ui:widget": "hidden",
    },
  }

  return (
    <Form
      schema={venueSchema}
      uiSchema={uiSchema}
      formData={venue}
      validator={validator}
      onSubmit={submit}
      noValidate
    >
      <Button type="submit" variant="contained">Submit</Button>
      <Button sx={{marginLeft: "2em"}} onClick={cancel} variant="outlined">Cancel</Button>
    </Form>
  );
};

VenueForm.defaultProps = {
  "isNew": false
}

export default VenueForm;