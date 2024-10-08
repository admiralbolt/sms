import { IChangeEvent } from "@rjsf/core";
import { Form } from "@rjsf/mui";
import { RJSFSchema, WidgetProps } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { AxiosError } from "axios";
import React, { useContext } from "react";

import { Button } from "@mui/material";

import { VenueSelect } from "@/components/Venues";
import { SnackbarContext } from "@/contexts/SnackbarContext";
import { createEvent, updateEvent } from "@/hooks/api";
import { useSchema } from "@/hooks/schema";
import { Event } from "@/types";

interface Props {
  event: Event;
  setEdit: React.Dispatch<React.SetStateAction<boolean>>;
  isNew?: boolean;
  createCallback?: (id: number) => void;
  updateCallback?: (id: number) => void;
}

const emptyCallback = (_id: number) => {
  return;
};

export const EventForm = ({
  event,
  setEdit,
  isNew,
  createCallback = emptyCallback,
  updateCallback = emptyCallback,
}: Props) => {
  const { setSnackbar } = useContext(SnackbarContext) || {};
  const { eventSchema } = useSchema();

  const submit = (submitEvent: IChangeEvent<any, RJSFSchema, any>) => {
    if (isNew) {
      createEvent(submitEvent.formData).then(
        (response) => {
          setSnackbar({
            open: true,
            severity: "success",
            message: `Event ${response.data.title} updated successfully!`,
          });
          setEdit(false);
          createCallback(response.data["id"]);
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

    updateEvent(submitEvent.formData).then(
      (response) => {
        setSnackbar({
          open: true,
          severity: "success",
          message: `Event ${response.data.title} updated successfully!`,
        });
        setEdit(false);
        updateCallback(response.data["id"]);
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
    event_image: {
      "ui:widget": "hidden",
    },
    start_time: {
      "ui:widget": "time",
    },
    end_time: {
      "ui:widget": "time",
    },
    doors_open: {
      "ui:widget": "time",
    },
    signup_start_time: {
      "ui:widget": "time",
    },
    venue: {
      "ui:widget": (props: WidgetProps) => {
        return (
          <VenueSelect
            venueId={props.value}
            onChange={(event: any) => props.onChange(event.target.value)}
          />
        );
      },
    },
  };

  return (
    <Form
      schema={eventSchema}
      uiSchema={uiSchema}
      formData={event}
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

EventForm.defaultProps = {
  isNew: false,
};
