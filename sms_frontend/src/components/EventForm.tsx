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

  return (
    <Form
      schema={eventSchema}
      formData={event}
      validator={validator}
      onChange={log('changed')}
      onSubmit={log('submitted')}
      onError={log('errors')}
    />
  );
};

export default EventForm;