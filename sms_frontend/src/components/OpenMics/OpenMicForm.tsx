import { IChangeEvent } from "@rjsf/core";
import { Form } from "@rjsf/mui";
import { WidgetProps } from "@rjsf/utils";
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { AxiosError } from "axios";
import { useContext } from "react";

import { Button } from "@mui/material";

import { VenueSelect } from "@/components/Venues";
import { SnackbarContext } from "@/contexts/SnackbarContext";
import { createOpenMic, updateOpenMic } from "@/hooks/api";
import { useSchema } from "@/hooks/schema";
import { OpenMic } from "@/types";

interface Props {
  openMic: OpenMic;
  setEdit: React.Dispatch<React.SetStateAction<boolean>>;
  isNew?: boolean;
  createCallback?: (id: number) => void;
}

const emptyCallback = (_id: number) => {
  return;
};

export const OpenMicForm = ({
  openMic,
  setEdit,
  isNew,
  createCallback = emptyCallback,
}: Props) => {
  const { setSnackbar } = useContext(SnackbarContext) || {};
  const { openMicSchema } = useSchema();

  const submit = (submitOpenMic: IChangeEvent<any, RJSFSchema, any>) => {
    if (isNew) {
      createOpenMic(submitOpenMic.formData).then(
        (response) => {
          setSnackbar({
            open: true,
            severity: "success",
            message: `openMic ${response.data.name} updated successfully!`,
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

    updateOpenMic(submitOpenMic.formData).then(
      (response) => {
        setSnackbar({
          open: true,
          severity: "success",
          message: `openMic ${response.data.name} updated successfully!`,
        });
        setEdit(false);
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
    signup_start_time: {
      "ui:widget": "time",
    },
    event_start_time: {
      "ui:widget": "time",
    },
    event_end_time: {
      "ui:widget": "time",
    },
    venue: {
      "ui:widget": (props: WidgetProps) => {
        return (
          <VenueSelect
            venueId={props.value}
            onChange={(openMic: any) => props.onChange(openMic.target.value)}
          />
        );
      },
    },
  };

  return (
    <Form
      schema={openMicSchema}
      uiSchema={uiSchema}
      formData={openMic}
      validator={validator}
      onSubmit={submit}
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

OpenMicForm.defaultProps = {
  isNew: false,
};
