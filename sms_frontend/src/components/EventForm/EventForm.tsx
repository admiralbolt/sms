import { Event } from "@/types";

import { useSchema } from "@/hooks/schema";

import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";

interface Props {
  event: Event;
}

export const EventForm = ({ event }: Props) => {
  const { eventSchema } = useSchema();

  const log = (type: string) => console.log.bind(console, type);

  return (
    <Form
      schema={eventSchema}
      formData={event}
      validator={validator}
      onChange={log("changed")}
      onSubmit={log("submitted")}
      onError={log("errors")}
    />
  );
};
