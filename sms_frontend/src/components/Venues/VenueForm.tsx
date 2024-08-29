import { Form } from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import { AxiosError } from "axios";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@mui/material";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import { createVenue, updateVenue } from "@/hooks/api";
import { useSchema } from "@/hooks/schema";
import { Venue } from "@/types";

interface Props {
  venue: Venue;
  setEdit: any;
  isNew?: boolean;
  setIsNew?: any;
  updateCallback?: any;
}

export const VenueForm = ({ venue, setEdit, isNew }: Props) => {
  const { setSnackbar } = useContext(SnackbarContext) || {};
  const { venueSchema } = useSchema();
  const navigate = useNavigate();

  const submit = (submitVenue: any) => {
    if (isNew) {
      createVenue(submitVenue.formData).then(
        (response) => {
          setSnackbar({
            open: true,
            severity: "success",
            message: `Venue ${response.data.name} updated successfully!`,
          });
          setEdit(false);
          navigate(`/venues/${response.data["slug"]}`);
        },
        (error: AxiosError) => {
          setSnackbar({
            open: true,
            severity: "error",
            message: error.message,
          });
        },
      );

      return;
    }

    updateVenue(submitVenue.formData).then(
      (response) => {
        setSnackbar({
          open: true,
          severity: "success",
          message: `Venue ${response.data.name} updated successfully!`,
        });
        setEdit(false);
        navigate(`/venues/${response.data["slug"]}`);
      },
      (error: AxiosError) => {
        setSnackbar({
          open: true,
          severity: "error",
          message: error.message,
        });
      },
    );
  };

  const cancel = () => {
    setEdit(false);
  };

  const uiSchema: object = {
    description: {
      "ui:widget": "textarea",
    },
    alias: {
      "ui:widget": "textarea",
    },
    venue_tags: {
      "ui:widget": "hidden",
    },
    venue_image: {
      "ui:widget": "hidden",
    },
  };

  return (
    <Form
      schema={venueSchema}
      uiSchema={uiSchema}
      formData={venue}
      validator={validator}
      onSubmit={submit}
      noValidate
    >
      <Button type="submit" variant="contained">
        Submit
      </Button>
      <Button sx={{ marginLeft: "2em" }} onClick={cancel} variant="outlined">
        Cancel
      </Button>
    </Form>
  );
};

VenueForm.defaultProps = {
  isNew: false,
};
