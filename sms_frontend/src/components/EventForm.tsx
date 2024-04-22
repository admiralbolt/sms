import { Event } from "@/types";

import { useSchema } from "@/hooks/schema";

import validator from '@rjsf/validator-ajv8';
import { Form } from '@rjsf/mui';

interface Props {
  event: Event;
}

const EventForm = ({ event }: Props) => {

  const { eventSchema } = useSchema();

  const log = (type: any) => console.log.bind(console, type);

  const uiSchema: object = {
    "description": {
      "ui:widget": "textarea"
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
    }
  }

  return (
    <Form
      schema={eventSchema}
      uiSchema={uiSchema}
      formData={event}
      validator={validator}
      onChange={log('changed')}
      onSubmit={log('submitted')}
      onError={log('errors')}
    />
  );
};

export default EventForm;