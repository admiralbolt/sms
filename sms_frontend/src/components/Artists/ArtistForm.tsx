import { Form } from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import { AxiosError } from "axios";
import { useContext } from "react";

import { Button } from "@mui/material";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import { createArtist, updateArtist } from "@/hooks/api";
import { useSchema } from "@/hooks/schema";
import { Artist } from "@/types";

interface Props {
  artist: Artist;
  setEdit: any;
  isNew?: boolean;
  setIsNew?: any;
  createCallback?: any;
  updateCallback?: any;
}

export const ArtistForm = ({
  artist,
  setEdit,
  isNew,
  createCallback,
  updateCallback,
}: Props) => {
  const { setSnackbar } = useContext(SnackbarContext) || {};
  const { artistSchema } = useSchema();

  const submit = (submitArtist: any) => {
    if (isNew) {
      createArtist(submitArtist.formData).then(
        (response) => {
          setSnackbar({
            open: true,
            severity: "success",
            message: `Artist ${response.data.name} updated successfully!`,
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

    updateArtist(submitArtist.formData).then(
      (response) => {
        setSnackbar({
          open: true,
          severity: "success",
          message: `Artist ${response.data.name} updated successfully!`,
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
    bio: {
      "ui:widget": "textarea",
    },
    artist_image: {
      "ui:widget": "hidden",
    },
    social_links: {
      items: {
        artist: {
          "ui:widget": "hidden",
        },
      },
    },
  };

  return (
    <Form
      schema={artistSchema}
      uiSchema={uiSchema}
      formData={artist}
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

ArtistForm.defaultProps = {
  isNew: false,
};
